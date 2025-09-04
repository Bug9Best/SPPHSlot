import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Firestore, collectionData, runTransaction, doc, collection, addDoc, getDocs, query, where, DocumentReference, getDoc, updateDoc } from '@angular/fire/firestore';

export interface Rooms {
  id?: string;
  uuid: string,
  name: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationsService {
  private firestore = inject(Firestore);

  getRegistrationByRoom(roomUUID: string): Observable<any[]> {
    const roomsRef = collection(this.firestore, 'registrations');
    const q = query(roomsRef,
      where('roomUUID', '==', roomUUID),
      where('status', '==', 1)
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  reserveTicket$(prize: number, uuid: string): Observable<DocumentReference[]> {
    return from(this.reserveTicket(prize, uuid));
  }

  clearTicket$(uuid: string): Observable<void> {
    return from(this.clearTicket(uuid));
  }

  async reserveTicket(totalPrize: number, uuid: string): Promise<DocumentReference[]> {
    const counterRef = doc(this.firestore, 'counters/registrations');
    const registrationsRef = collection(this.firestore, 'registrations');

    return runTransaction(this.firestore, async (tx) => {
      const counterSnap = await tx.get(counterRef);
      let nextId = counterSnap.exists() ? counterSnap.data()['lastId'] + 1 : 1;

      // query ภายใน transaction
      const registrationsSnap = await getDocs(query(
        registrationsRef,
        where('status', '==', 1)
      ));

      // filter ภายใน transaction
      const filteredDocs = registrationsSnap.docs.filter(docSnap => docSnap.data()['roomUUID'] !== uuid);

      const newDocs: DocumentReference[] = [];

      for (const docSnap of filteredDocs) {
        const data = docSnap.data();
        const registrationId = String(nextId).padStart(3, '0');
        nextId++;

        const newData = {
          ...data,
          roomUUID: uuid,
          totalPrize: totalPrize,
        };

        const newDocRef = doc(registrationsRef, registrationId);
        tx.set(newDocRef, newData);
        newDocs.push(newDocRef);
      }

      // อัพเดต counter หลังสร้างทุก document
      tx.set(counterRef, { lastId: nextId - 1 });

      return newDocs;
    });
  }

  async clearTicket(uuid: string): Promise<void> {
    //  Delete all registrations with the given roomUUID
    const registrationsRef = collection(this.firestore, 'registrations');
    const q = query(registrationsRef, where('roomUUID', '==', uuid));

    const querySnapshot = await getDocs(q);
    const batchPromises = querySnapshot.docs.map(docSnap => {
      return updateDoc(docSnap.ref, { status: 0 });
    });

    await Promise.all(batchPromises);
  }

  registrations$(data: any): Observable<DocumentReference> {
    return from(this.registrations(data));
  }

  async registrations(registrations: any) {
    const counterRef = doc(this.firestore, 'counters/registrations');
    const registrationsRef = collection(this.firestore, 'registrations');
    const roomsRef = collection(this.firestore, 'rooms');
    const usersRef = collection(this.firestore, 'users');

    const userQuery = query(
      usersRef,
      where('id', '==', String(registrations.luckyNumber).padStart(3, '0'))
    );

    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      throw new Error('ไม่พบผู้ใช้ที่มี Lucky Number นี้');
    }

    const roomQuery = query(
      roomsRef,
      where('uuid', '==', registrations.roomUUID)
    );

    const roomSnap = await getDocs(roomQuery);

    if (roomSnap.empty) {
      throw new Error('ไม่พบห้องนี้');
    }

    let registrationName: string | null = null;
    let userUUID: string | null = null;
    let totalPrize: number = 0;
    userSnap.forEach((doc) => {
      registrationName = doc.data()['prefix'] + doc.data()['fname'] + ' ' + doc.data()['lname'];
      userUUID = doc.data()['uuid'];
    });

    roomSnap.forEach((doc) => {
      totalPrize = doc.data()['totalPrize'] || 0;
    });

    return runTransaction(this.firestore, async (tx) => {
      const duplicateQuery = query(
        registrationsRef,
        where('luckyNumber', '==', String(registrations.luckyNumber).padStart(3, '0')),
        where('roomUUID', '==', registrations.roomUUID),
      );

      const dupSnap = await getDocs(duplicateQuery);

      if (!dupSnap.empty) {
        throw new Error('ไม่สามารถทำรายการได้ เนื่องจากได้ทำการลงทะเบียนห้องนี้ไปแล้ว');
      }

      const counterSnap = await tx.get(counterRef);
      let nextId = 1;

      if (counterSnap.exists()) {
        nextId = counterSnap.data()['lastId'] + 1;
        tx.update(counterRef, { lastId: nextId });
      } else {
        tx.set(counterRef, { lastId: 1 });
      }

      const registrationsId = String(nextId).padStart(3, '0');
      registrations.id = registrationsId;
      registrations.luckyNumber = String(registrations.luckyNumber).padStart(3, '0');
      registrations.roomUUID = registrations.roomUUID;
      registrations.userUUID = userUUID;
      registrations.registrationName = registrationName;
      registrations.roomTotalPrize = totalPrize;
      registrations.status = 1;

      const newRoomRef = doc(registrationsRef, registrationsId);
      tx.set(newRoomRef, registrations);

      return { id: newRoomRef.id, ...registrations };
    });
  }
}
