import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type PhotoId = Text;

  type Photo = {
    id : PhotoId;
    name : Text;
    mimeType : Text;
    uploadedAt : Time.Time;
    blob : Storage.ExternalBlob;
  };

  module Photo {
    public func compareByUploadedAt(p1 : Photo, p2 : Photo) : Order.Order {
      Int.compare(p2.uploadedAt, p1.uploadedAt);
    };
  };

  let photos = Map.empty<PhotoId, Photo>();

  public shared ({ caller }) func uploadPhoto(name : Text, mimeType : Text, blob : Storage.ExternalBlob) : async PhotoId {
    if (name.isEmpty()) {
      Runtime.trap("Photo name cannot be empty");
    };

    let id = Time.now().toText();
    let photo : Photo = {
      id;
      name;
      mimeType;
      uploadedAt = Time.now();
      blob;
    };
    photos.add(id, photo);
    id;
  };

  public shared ({ caller }) func deletePhoto(photoId : PhotoId) : async () {
    switch (photos.get(photoId)) {
      case (?_photo) { photos.remove(photoId) };
      case (null) { Runtime.trap("Photo not found") };
    };
  };

  public query ({ caller }) func getAllPhotos() : async [Photo] {
    photos.values().toArray().sort(Photo.compareByUploadedAt);
  };

  public query ({ caller }) func getPhotoBlob(photoId : PhotoId) : async Storage.ExternalBlob {
    switch (photos.get(photoId)) {
      case (?photo) { photo.blob };
      case (null) { Runtime.trap("Photo not found") };
    };
  };
};
