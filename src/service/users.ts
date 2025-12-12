import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Firestore, collectionData, runTransaction, doc, collection, addDoc, getDocs, query, where, DocumentReference } from '@angular/fire/firestore';

export interface Users {
  id?: string;
  uuid: string,
  prefix: string;
  fname: string;
  lname: string;
  walkin: boolean;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private firestore = inject(Firestore);

  getUsers(): Observable<Users[]> {
    return collectionData(
      collection(this.firestore, 'users'),
      { idField: 'id' }
    ) as Observable<Users[]>;
  }

  getUserByUUID(uuid: string): Observable<Users | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const userQuery = query(usersRef, where('uuid', '==', uuid));

    return collectionData(userQuery, { idField: 'id' }).pipe(
      map(users => (users.length > 0 ? users[0] as Users : undefined))
    );
  }

  checkIn$(user: any): Observable<DocumentReference> {
    return from(this.CheckIn(user));
  }

  async CheckIn(user: any) {
    const counterRef = doc(this.firestore, 'counters/users');
    const usersRef = collection(this.firestore, 'users');

    return runTransaction(this.firestore, async (tx) => {

      const now = new Date();
      const startTime = new Date();
      startTime.setHours(6, 30, 0, 0);

      if (now < startTime) {
        throw new Error('ระบบเปิดให้ลงทะเบียนได้ในเวลา 06:30 น. เป็นต้นไป');
      }

      const duplicateQuery = query(
        usersRef,
        where('prefix', '==', user.prefix),
        where('fname', '==', user.fname),
        where('lname', '==', user.lname)
      );

      const dupSnap = await getDocs(duplicateQuery);

      if (!dupSnap.empty) {
        throw new Error('ไม่สามารถทำรายการได้ เนื่องจากผู้ใช้งานนี้ลงทะเบียนแล้ว');
      }

      const counterSnap = await tx.get(counterRef);
      let nextId = 1;

      if (counterSnap.exists()) {
        nextId = counterSnap.data()['lastId'] + 1;
        tx.update(counterRef, { lastId: nextId });
      } else {
        tx.set(counterRef, { lastId: 1 });
      }

      const userId = String(nextId).padStart(3, '0');
      user.id = userId;
      user.uuid = crypto.randomUUID();
      user.isWalkin = true;
      user.isActive = true;
      user.role = "GUEST";
      user.tel = user.tel || '';

      const newUserRef = doc(usersRef, userId);
      tx.set(newUserRef, user);

      return { id: newUserRef.id, ...user };
    });
  }
}
