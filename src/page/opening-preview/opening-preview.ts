import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-opening-preview',
  imports: [
    ButtonModule,
    RouterLink
  ],
  templateUrl: './opening-preview.html',
  styleUrl: './opening-preview.scss',
})
export class OpeningPreview {

  private firestore: Firestore = inject(Firestore);
  private statusSub!: Subscription;

  isChiefActionLocked = signal<boolean>(false);

  ngOnInit() {
    this.listenToCeremonyStatus();
  }

  ngOnDestroy() {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  private listenToCeremonyStatus() {
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');

    this.statusSub = docData(statusDocRef).subscribe((data: any) => {
      if (data) {
        this.isChiefActionLocked.set(data.chiefActionLock);
      }
    });
  }

  async handScan() {
    if (this.isChiefActionLocked()) {
      console.log('Action is locked. Cannot scan palm yet.');
      return;
    }

    const triggerRef = doc(this.firestore, 'ceremony', 'status');
    try {
      await setDoc(triggerRef, {
        chiefAction: true,
      }, { merge: true });
    } catch (error) {
      console.error('Error triggering:', error);
    }
  }
}
