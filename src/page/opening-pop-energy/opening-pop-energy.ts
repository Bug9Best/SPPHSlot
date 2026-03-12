import { Component, inject, signal } from '@angular/core';
import { Firestore, doc, updateDoc, onSnapshot, docData } from '@angular/fire/firestore';

interface CeremonyState {
  energy: number;
  maxEnergy?: number;
  chiefAction: boolean;
  ceremonyStarted: boolean;
}

@Component({
  selector: 'app-opening-pop-energy',
  imports: [],
  templateUrl: './opening-pop-energy.html',
  styleUrl: './opening-pop-energy.scss',
})
export class OpeningPopEnergy {

  private firestore: Firestore = inject(Firestore);
  private docRef = doc(this.firestore, 'ceremony/status');

  isReady = signal<boolean>(false);
  isPressing = signal<boolean>(false);

  state = signal<CeremonyState>({
    energy: 0,
    maxEnergy: 1000,
    chiefAction: false,
    ceremonyStarted: false
  });

  ngOnInit() {
    onSnapshot(this.docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CeremonyState;
        this.state.set(data);
        this.isReady.set(true);
      } else {
        console.error("หา Document ไม่เจอใน Firestore!");
      }
    });
  }

  async handleUserClick() {
    if (!this.isReady()) return;

    const currentEnergy = this.state().energy;
    const maxEnergy = this.state().maxEnergy ?? 1000;
    if (currentEnergy < maxEnergy) {
      try {
        await updateDoc(this.docRef, {
          energy: currentEnergy + 1
        });
      } catch (e) {
        console.error("Update error", e);
      }
    }
  }
}
