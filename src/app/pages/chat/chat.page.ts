import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { observable, Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { PhotoService } from '../../services/photo.service'
import { AngularFireStorage, GetDownloadURLPipe } from '@angular/fire/storage';
import { finalize, tap } from 'rxjs/operators';
import { imgFile } from './../../services/chat.service';
import { getUrl } from '@ionic/angular/directives/navigation/stack-utils';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  
  messages: Observable<any[]>;
  newMsg = '';
  secretKey = "EtuhVJjemKlfIaDNyYIgyljbjpUn4rH4bKACH2og";

  constructor(public photoService: PhotoService,
    private storage: AngularFireStorage,
    private chatService: ChatService,
     private router: Router) { }


  addPhotoToGallery() {
    this.photoService.addNewToGallery();
    this.content.scrollToBottom();
    
  }

  ngOnInit() {
    this.messages = this.chatService.getChatMessages();
    this.getImages();
  }




  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }


 
  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  decrypt(textToDecrypt : string){
    return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
  }
  getImages(){
   
    const filePath = "";
    // Crea una referencia de acceso
    const fileRef = this.storage.ref(filePath);
    let listPhotos=fileRef.listAll();
    window.alert(listPhotos);


    console.log("Fotos", listPhotos.forEach);

  }

  uploadImage(event: FileList) {
    //console.log('Entrando a guardar imagen')
    const file = event.item(0)
    console.log(file);

    // Image validation
    /*if (file.type.split('/')[0] !== 'image') { 
      console.log('File type is not supported!')
      return;
    }else{
      console.log('Type is not supported!')
    }*/

    this.chatService.isFileUploading = true;
    this.chatService.isFileUploaded = false;

    this.chatService.imgName = file.name;
    console.log('Image Name: ',file.name)
    console.log('Image Name Chat Service: ',this.chatService.imgName)
    // Storage path
    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;
    console.log('Path FileStorage: ',fileStoragePath)
    // Image reference
    const imageRef = this.chatService.afStorage.ref(fileStoragePath);

    imageRef.put(file);

    const filePath = "filesStorage/";
    // Crea una referencia de acceso
    const fileRef = this.storage.ref(filePath);
    fileRef.listAll().toPromise().then(async response=>{
      console.log(response);
      for(let item of response.items){
       console.log("Item URLLLLLL",item.getDownloadURL());
        //const url= await GetDownloadURLPipe(item);
       
      }
    })

    


}


storeFilesFirebase(image: imgFile) {
  const fileId = this.chatService.afs.createId();
  
  this.chatService.filesCollection.doc(fileId).set(image).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  });
}

}

