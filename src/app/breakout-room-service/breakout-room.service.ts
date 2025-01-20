import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { BreakoutRoom } from '../redux/reducer';

@Injectable({
  providedIn: 'root',
})
export class BreakoutRoomService {
  private readonly apiUrl = `http://localhost:80/api/meeting`;

  constructor(private http: HttpClient) {}

  // createBreakoutRoom(roomData: BreakoutRoom): Observable<BreakoutRoom> {
  //   return this.http.post<BreakoutRoom>(this.apiUrl, roomData);
  // }

  createBreakoutRoom(roomData: BreakoutRoom): Observable<BreakoutRoom> {
    const url = `${this.apiUrl}/${roomData.roomName}/breakout-room`; // Correct URL construction
    console.log('serv is', roomData.roomName);
    return this.http.post<BreakoutRoom>(url, roomData).pipe(
      catchError((error) => {
        console.error('Error creating breakout room:', error);
        console.error('Failed URL:', url); // Log the URL for debugging
        return throwError(() => error); // Re-throw the error after logging it
      })
    );
  }

  getAllBreakoutRooms(roomName: string): Observable<BreakoutRoom[]> {
    const url = `${this.apiUrl}/${roomName}`;
    return this.http.get<BreakoutRoom[]>(`${url}/breakout-room`);
  }

  deleteBreakoutRoom(mainRoom: string, roomId: string): Observable<void> {
    const url = `${this.apiUrl}/${mainRoom}/breakout-room/${roomId}`;
    return this.http.delete<void>(url).pipe(
      catchError((error) => {
        console.error('Error deleting breakout room:', error);
        return throwError(() => error);
      })
    );
  }
}
