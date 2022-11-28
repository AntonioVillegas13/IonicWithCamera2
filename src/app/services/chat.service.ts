import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';

export interface User {
  uid: string;
  email: string;
}
 
export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

export interface imgFile {
  name: string;
  filepath: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  currentUser: User = null;

  secretKey = "EtuhVJjemKlfIaDNyYIgyljbjpUn4rH4bKACH2og";
  
  public filesCollection: AngularFirestoreCollection<imgFile>;
    // File upload task 
    fileUploadTask: AngularFireUploadTask;

    // Upload progress
    percentageVal: Observable<number>;
  
    // Track file uploading with snapshot
    trackSnapshot: Observable<any>;
  
    // Uploaded File URL
    UploadedImageURL: Observable<string>;
  
    // Uploaded image collection
    files: Observable<imgFile[]>;
  
    // Image specifications
    imgName: string;
    imgSize: number;
  
    // File uploading status
    isFileUploading: boolean;
    isFileUploaded: boolean;


    constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore, public afStorage: AngularFireStorage, ) {
      this.afAuth.onAuthStateChanged(user => {
        console.log('User: ', user.providerData[0].uid);
        this.currentUser = user;
      });
      this.isFileUploading = false;
      this.isFileUploaded = false;
      
      // Define uploaded files collection
      this.filesCollection = afs.collection<imgFile>('imagesCollection');
      this.files = this.filesCollection.valueChanges();
    }

  async signup({ email, password }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    
    console.log('results', credential);
    const uid = credential.user.uid;
 
    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credential.user.email,
    })
  }
 
  signIn({ email, password }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
 
  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }
 
  // Chat functionality
 
  addChatMessage(msg) {
    console.log("siiiiiiiiiii2222222",this.fileUploadTask);
    console.log("siiiiiiiiiiiiiiiiiiiiiiiiiiii",this.UploadedImageURL)
    console.log("siiiiSiseeeSizze",this.imgName)

    if( this.imgName!== undefined ) {
      return this.afs.collection('messages').add({
        msg,
        from: this.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
    } else {
      return this.afs.collection('messages').add({
        msg,
        from: this.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
      });
    }
  }

 
  getChatMessages() {
    let users = [];

    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        console.log('all users: ', users);
        return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' }) as Observable<Message[]>
      }),
      map(messages => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }
        console.log('all messages: ', messages);
        return messages;
      })
    )
  }
 
  getUsers() {
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }
   
  getUserForMsg(msgFromId, users: User[]): string {    
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    return 'User';
  }

encrypt(value : string) : string{
  return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
}

decrypt(textToDecrypt : string){
  return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
}
}
