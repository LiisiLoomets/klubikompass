import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';


@Injectable({
  providedIn: 'root',
})
export class UserLocationService {
  async getCurrentPosition(): Promise<[number, number]> {
    const position = await Geolocation.getCurrentPosition();

    return [position.coords.latitude, position.coords.longitude];
  }
}
