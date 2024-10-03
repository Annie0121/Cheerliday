export async  function  getCoordinates(address:string) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
   
    const encodedCity = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    const addressComponents = data.results[0].address_components;
    const location = data.results[0].geometry.location;
    const cityname = addressComponents[0].long_name
    
    let countryCode = "";
    for (let component of addressComponents) {
        if (component.types.includes("country")) {
        countryCode = component.short_name; 
        break;
        }
    }

    return {
        coordinates:{
            lat: location.lat,
            lng: location.lng,
        },
        countryCode: countryCode,
        cityname:cityname
    };
  }

