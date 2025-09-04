import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Firestore, collectionData, runTransaction, doc, collection, addDoc, getDocs, query, where, DocumentReference, updateDoc } from '@angular/fire/firestore';

export interface Rooms {
  id?: string;
  uuid: string,
  name: string;
  status: number;
  totalPrize: number;
  isCondition: boolean;
  isLocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private firestore = inject(Firestore);

  getRooms(): Observable<Rooms[]> {
    return collectionData(
      collection(this.firestore, 'rooms'),
      { idField: 'id' }
    ) as Observable<Rooms[]>;
  }

  getRoomsByUUID(uuid: string): Observable<Rooms | undefined> {
    const roomsRef = collection(this.firestore, 'rooms');
    const roomQuery = query(roomsRef, where('uuid', '==', uuid));

    return collectionData(roomQuery, { idField: 'id' }).pipe(
      map(rooms => (rooms.length > 0 ? rooms[0] as Rooms : undefined))
    );
  }

  createRoom$(user: any): Observable<DocumentReference> {
    return from(this.createRoom(user));
  }

  updateRoomLock$(roomId: string, isLocked: boolean): Observable<void> {
    return from(this.updateRoomLock(roomId, isLocked));
  }

  async updateRoomLock(roomId: string, isLocked: boolean): Promise<void> {
    const roomsRef = collection(this.firestore, 'rooms');
    const roomQuery = query(roomsRef, where('uuid', '==', roomId));

    const querySnapshot = await getDocs(roomQuery);
    if (!querySnapshot.empty) {
      const roomDoc = querySnapshot.docs[0];
      const roomRef = doc(this.firestore, 'rooms', roomDoc.id);

      await updateDoc(roomRef, { isLocked: isLocked });
    } else {
      throw new Error('Room not found');
    }
  }

  async createRoom(room: any) {
    const counterRef = doc(this.firestore, 'counters/rooms');
    const roomsRef = collection(this.firestore, 'rooms');

    return runTransaction(this.firestore, async (tx) => {
      const duplicateQuery = query(
        roomsRef,
        where('name', '==', room.name),
      );

      const dupSnap = await getDocs(duplicateQuery);

      if (!dupSnap.empty) {
        throw new Error('ไม่สามารถทำรายการได้ เนื่องจากห้องนี้มีอยู่แล้ว');
      }

      const counterSnap = await tx.get(counterRef);
      let nextId = 1;

      if (counterSnap.exists()) {
        nextId = counterSnap.data()['lastId'] + 1;
        tx.update(counterRef, { lastId: nextId });
      } else {
        tx.set(counterRef, { lastId: 1 });
      }

      const roomId = String(nextId).padStart(3, '0');
      room.id = roomId;
      room.uuid = crypto.randomUUID();
      room.name = room.name;
      room.status = 1;
      room.totalPrize = room.totalPrize;
      room.isCondition = room.isCondition;
      room.isLocked = true;

      const newRoomRef = doc(roomsRef, roomId);
      tx.set(newRoomRef, room);

      return { id: newRoomRef.id, ...room };
    });
  }
}
