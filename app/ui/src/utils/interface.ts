export interface Store {
    id: String;
    address: String;
    name: String;
    lat_lng: {
      latitude: Number;
      longitude: Number;
    };
    website: String;
    logo?: String;
    country: String;
    state: String;
    city: String;
    products: Array<String>;
  }
  