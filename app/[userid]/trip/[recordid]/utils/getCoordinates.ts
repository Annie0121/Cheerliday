
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function  getCoordinates(address:string,countryCode:string) {
    console.log(countryCode);
    
     
      const encodedCity = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCity}&region=${countryCode}&key=${apiKey}`;
  
      const response = await fetch(url);
      const data = await response.json();
     // console.log(data.results[0].place_id);
      const placeId=data.results[0].place_id
      const location = data.results[0].geometry.location;
      
      
      return {
        coordinates:{
          lat: location.lat,
          lng: location.lng
        },
        placeId:placeId
        
      };
    }
  