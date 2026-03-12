import { Component, ElementRef, ViewChild } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-opening-listener',
  imports: [],
  templateUrl: './opening-listener.html',
  styleUrl: './opening-listener.scss',
})
export class OpeningListener {

  constructor(private firestore: Firestore) { }
  ngOnInit() {
    const triggerRef = doc(this.firestore, 'triggers', 'openingCeremony');
    onSnapshot(triggerRef, (snapshot) => {
      const data = snapshot.data();
      if (data && data['isTriggered']) {
        this.startGrandOpening();
      }
    });
  }

  @ViewChild('labReady') labReady!: ElementRef;
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  startGrandOpening() {
    if (this.labReady) {
      // this.labReady.nativeElement.src = 'image/accessGranted.png';
    }
  }
}
