import { Component, } from '@angular/core';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-opening-action',
  imports: [],
  templateUrl: './opening-action.html',
  styleUrl: './opening-action.scss',
})
export class OpeningAction {

  constructor(private firestore: Firestore) { }

  async palmScan() {
    console.log('Palm scanning...');
    const triggerRef = doc(this.firestore, 'triggers', 'openingCeremony');

    try {
      await setDoc(triggerRef, {
        isTriggered: true,
        triggeredAt: serverTimestamp()
      }, { merge: true }); 

      console.log('Trigger sent successfully!');
    } catch (error) {
      console.error('Error triggering:', error);
    }
  }
}
