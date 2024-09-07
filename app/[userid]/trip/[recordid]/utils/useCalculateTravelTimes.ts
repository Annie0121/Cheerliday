"use client"


import React, { useEffect} from 'react';
import {useMapsLibrary } from '@vis.gl/react-google-maps';


interface DateRangeItem {
    date: string;
    startTime:string;
    attractions: Attraction[];
}
interface Attraction {
    coordinates: Coordinates;
    name: string;
    address:string,
    picture:string,
    stayDuration: number
}

interface Coordinates {
    lat: number;
    lng: number;
}

interface calculateTravelTimes{
    dateRange: DateRangeItem[];
    setTravelTimes:React.Dispatch<React.SetStateAction<{}>>
  }

export function useCalculateTravelTimes({dateRange,setTravelTimes}:calculateTravelTimes) {
    const routes = useMapsLibrary("routes");
    useEffect(() => {
        if (!routes) {
            console.log("Routes library is not loaded yet");
            return;
          }
      const service = new routes.DistanceMatrixService();
      const newTravelTimes: { [key: string]: string[] } = {};
  
      const calculateDistances = async () => {
        for (const day of dateRange) {
          newTravelTimes[day.date] = [];
          const { attractions } = day;
          if (attractions.length < 2) continue;
          for (let i = 0; i < attractions.length - 1; i++) {
            const origin = attractions[i].coordinates;
            const destination = attractions[i + 1].coordinates;
            try {
              const response = await new Promise((resolve, reject) => {
                service.getDistanceMatrix(
                  {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: routes.TravelMode.DRIVING,
                  },
                  (response, status) => {
                    if (status === routes.DistanceMatrixStatus.OK) {
                      if (response) {
                        const results = response.rows[0].elements[0];
                        newTravelTimes[day.date].push(results.duration.text);
                      }resolve(null);
                    } else {
                      reject(status);
                    }
                  }
                );
              });
            } catch (error) {
              console.error('錯誤:', error);
              newTravelTimes[day.date].push('計算錯誤');
            }
          }
        }
        setTravelTimes(newTravelTimes)
      };
      calculateDistances();
    }, [routes, dateRange]);
  }