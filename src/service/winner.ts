import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { Firestore, collectionData, runTransaction, doc, collection, addDoc, getDocs, query, where, DocumentReference, updateDoc, setDoc, getDoc, orderBy, deleteDoc } from '@angular/fire/firestore';

export interface Winners {
  id?: string;
  registrationId: string,
  registrationName: string;
  luckyNumber: string;
  roomName: string;
  roomUUID: string;
  userUUID: string;
}

@Injectable({
  providedIn: 'root'
})
export class WinnerService {
  private firestore = inject(Firestore);

  getWinners(): Observable<Winners[]> {
    return collectionData(
      collection(this.firestore, 'winners'),
      { idField: 'id' }
    ) as Observable<Winners[]>;
  }

  getWinnersByRoomUUID(uuid: string): Observable<Winners[] | undefined> {
    const winnersRef = collection(this.firestore, 'winners');
    const winnerQuery = query(winnersRef, where('roomUUID', '==', uuid));

    return collectionData(winnerQuery, { idField: 'id' }) as Observable<Winners[] | undefined>;
  }


  submitWinner$(winner: any): Observable<void> {
    return from(this.submitWinner(winner));
  }

  async submitWinner(winner: any) {
    if (!winner || !winner.id) {
      throw new Error("winner object is invalid or missing id");
    }

    // 1) update status ของ registration
    const regRef = doc(this.firestore, 'registrations', winner.id);
    await updateDoc(regRef, { status: 2 });

    // 2) query หา room ตาม uuid เพื่อเอา roomName + totalPrize
    const roomsRef = collection(this.firestore, 'rooms');
    const roomQuery = query(roomsRef, where('uuid', '==', winner.roomUUID));
    const roomSnap = await getDocs(roomQuery);

    let roomName: string | null = null;
    let roomTotalPrize = 1;

    roomSnap.forEach((docSnap) => {
      const data: any = docSnap.data();
      roomName = data.name ?? null;
      roomTotalPrize = data.totalPrize ?? 1;
    });

    // 3) query หา winners ของห้องนี้ทั้งหมด
    const winnersRef = collection(this.firestore, 'winners');
    const winnersQuery = query(
      winnersRef,
      where('roomUUID', '==', winner.roomUUID),
    );
    const winnersSnap = await getDocs(winnersQuery);

    if (winnersSnap.size >= roomTotalPrize) {
      // 4) ถ้ามีครบแล้ว → ลบอันที่เก่าสุด
      const oldest = winnersSnap.docs[0]; // document แรกคือเก่าสุด
      await deleteDoc(oldest.ref);
    }

    // 5) เพิ่ม/แทนที่ winner ใหม่
    const winnerRef = doc(this.firestore, 'winners', winner.id);
    await setDoc(winnerRef, {
      registrationId: winner.id,
      userUUID: winner.userUUID,
      roomUUID: winner.roomUUID,
      luckyNumber: winner.luckyNumber,
      registrationName: winner.registrationName,
      roomName: roomName,
      createdAt: new Date()
    });
  }
}

// const counterRef = doc(this.firestore, 'counters/winners');
// const usersRef = collection(this.firestore, 'winners');

// return runTransaction(this.firestore, async (tx) => {
//   const duplicateQuery = query(
//     usersRef,
//     where('prefix', '==', user.prefix),
//     where('fname', '==', user.fname),
//     where('lname', '==', user.lname)
//   );

//   const dupSnap = await getDocs(duplicateQuery);

//   if (!dupSnap.empty) {
//     throw new Error('ไม่สามารถทำรายการได้ เนื่องจากผู้ใช้งานนี้ลงทะเบียนแล้ว');
//   }

//   const counterSnap = await tx.get(counterRef);
//   let nextId = 1;

//   if (counterSnap.exists()) {
//     nextId = counterSnap.data()['lastId'] + 1;
//     tx.update(counterRef, { lastId: nextId });
//   } else {
//     tx.set(counterRef, { lastId: 1 });
//   }

//   const userId = String(nextId).padStart(3, '0');
//   user.id = userId;
//   user.uuid = crypto.randomUUID();
//   user.isWalkin = true;
//   user.isActive = true;
//   user.role = "GUEST";

//   const newUserRef = doc(usersRef, userId);
//   tx.set(newUserRef, user);

//   return { id: newUserRef.id, ...user };
// });

