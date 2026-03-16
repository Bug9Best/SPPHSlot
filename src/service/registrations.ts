import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Firestore, collectionData, runTransaction, doc, collection, addDoc, getDocs, query, where, DocumentReference, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';

export interface Rooms {
  id?: string;
  uuid: string,
  name: string;
  status: number;
}

export interface GroupedTicket {
  userUUID: string;
  registrationName: string;
  totalCount: number;
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
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  reserveTicket$(prize: number, uuid: string): Observable<GroupedTicket[]> {
    return from(this.reserveTicket(prize, uuid));
  }

  clearTicket$(uuid: string): Observable<void> {
    return from(this.clearTicket(uuid));
  }

  async reserveTicket(totalPrize: number, uuid: string): Promise<GroupedTicket[]> {
    // ==========================================
    // ส่วนที่ 1: ดึงข้อมูลและจัดกลุ่ม (Client-side Join)
    // ==========================================
    const oldRegistrationsRef = collection(this.firestore, 'registrations');
    const querySnapshot = await getDocs(oldRegistrationsRef);

    const groupedData: Record<string, { count: number; name: string }> = {};

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userUUID = data['userUUID'];
      const name = data['registrationName'];

      if (userUUID) {
        if (!groupedData[userUUID]) {
          groupedData[userUUID] = { count: 0, name: name };
        }
        groupedData[userUUID].count += 1;
      }
    });

    const baseGroupedArray = Object.keys(groupedData).map(key => ({
      userUUID: key,
      registrationName: groupedData[key].name,
      totalCount: groupedData[key].count
    }));

    const finalResult: GroupedTicket[] = await Promise.all(
      baseGroupedArray.map(async (item) => {
        try {
          const usersRef = collection(this.firestore, 'users');
          const q = query(usersRef, where('uuid', '==', item.userUUID));
          const userQuerySnap = await getDocs(q);

          let canRandomValue = false;
          if (!userQuerySnap.empty) {
            canRandomValue = userQuerySnap.docs[0].data()['canRandom'] === true;
          }

          return { ...item, canRandom: canRandomValue };
        } catch (error) {
          return { ...item, canRandom: false };
        }
      })
    );

    // ==========================================
    // ส่วนที่ 2: คัดกรองและบันทึกข้อมูลใหม่
    // ==========================================

    const filterCounter = 6;
    const targetUsers = finalResult.filter(user => user.totalCount === filterCounter);

    if (targetUsers.length === 0) {
      console.log(`ไม่มีผู้ใช้ที่เข้าเงื่อนไข (totalCount = ${filterCounter})`);
      return [];
    }

    // 2. เริ่ม Transaction เพื่อรันเลขและบันทึกข้อมูล
    const counterRef = doc(this.firestore, 'counters/registrations');
    const registrationsRef = collection(this.firestore, 'registrations');

    await runTransaction(this.firestore, async (tx) => {
      // อ่านเลข Counter ล่าสุด
      const counterSnap = await tx.get(counterRef);
      let nextId = counterSnap.exists() ? counterSnap.data()['lastId'] + 1 : 1;

      // วนลูปสร้าง Document ใหม่สำหรับคนที่เข้าเงื่อนไข
      for (const user of targetUsers) {
        const runningString = String(nextId).padStart(3, '0'); // เช่น "001", "002"
        nextId++;

        // โครงสร้างข้อมูลตามภาพที่คุณแนบมา
        const newRegistrationData = {
          id: runningString,
          luckyNumber: runningString, // สมมติให้ luckyNumber เป็นเลขเดียวกับ id
          registrationName: user.registrationName,
          roomTotalPrize: totalPrize, // จาก Parameter
          roomUUID: uuid,             // จาก Parameter
          userUUID: user.userUUID
        };

        // กำหนด Document ID ให้ตรงกับ id (เช่น '001') แล้วสั่งบันทึก
        const newDocRef = doc(registrationsRef, runningString);
        tx.set(newDocRef, newRegistrationData);
      }

      // อัปเดตเลข Counter กลับลงไปใน Database
      tx.set(counterRef, { lastId: nextId - 1 });
    });
    return targetUsers;
  }

  async clearTicket(uuid: string): Promise<void> {
    const registrationsRef = collection(this.firestore, 'registrations');
    const q = query(registrationsRef, where('roomUUID', '==', uuid));

    const querySnapshot = await getDocs(q);
    const batchPromises = querySnapshot.docs.map(docSnap => {
      return deleteDoc(docSnap.ref);
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
    let isLocked: boolean = false;

    userSnap.forEach((doc) => {
      registrationName = doc.data()['prefix'] + doc.data()['fname'] + ' ' + doc.data()['lname'];
      userUUID = doc.data()['uuid'];
    });

    roomSnap.forEach((doc) => {
      totalPrize = doc.data()['totalPrize'] || 0;
      isLocked = doc.data()['isLocked'] || false;
    });

    if (isLocked) {
      throw new Error('ไม่สามารถทำรายการได้ เนื่องจากห้องนี้ถูก Lock อยู่');
    }

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

      const newRoomRef = doc(registrationsRef, registrationsId);
      tx.set(newRoomRef, registrations);

      return { id: newRoomRef.id, ...registrations };
    });
  }
}
