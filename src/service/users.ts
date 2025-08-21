import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Firestore, collectionData, runTransaction, doc, collection, addDoc, getDocs, query, where, DocumentReference } from '@angular/fire/firestore';

export interface Users {
  prefix: string;
  fname: string;
  lname: string;
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

  checkIn$(user: any): Observable<DocumentReference> {
    return from(this.CheckIn(user));
  }

  async CheckIn(user: any) {
    const counterRef = doc(this.firestore, 'counters/users');
    const usersRef = collection(this.firestore, 'users');

    return runTransaction(this.firestore, async (tx) => {
      const duplicateQuery = query(
        usersRef,
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

      const newUserRef = doc(usersRef, userId);
      tx.set(newUserRef, user);

      return { id: newUserRef.id, ...user };
    });
  }
}
