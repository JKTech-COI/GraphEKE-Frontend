import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  isInputEnable:boolean=false;
  chatInput:string='';
  chatHistory: any[] = [];
  source_selection:boolean=false;
  selectedSource: string = '';
  hostName:string='35.207.234.212';
  userName:string='root';
  password:string='tsql-Db-1077';
  port:string='3306';
  database:string='acme_insurance';
  selectedFile: any=[]; 
  loading:boolean=false;
  loading1:boolean=false;
  structName:any=[];
  UnstructName:any=[];
  chatMessages: { content: string; type: 'question' | 'response' }[] = [];

  constructor(private http:HttpClient,private toastr: ToastrService,private router: Router){

  }
  

  reset(){
    this.loading1=true;
    this.http.get('http://35.207.234.212:5000/refresh')
    .subscribe((response:any) => {
      console.log(response);
      this.loading1=false
      this.toastr.success(response);
      this.clear();
    },
    error=>{
      this.loading1=false;
    })
    
  }

  clear(){
    this.UnstructName=[];
    this.structName=[];
    this.selectedSource='';
    this.selectedFile=[];
    this.chatMessages=[];
    this.chatInput='';
    this.isStructured=false;
    this.isUnStructured=false;
    this.isStuctGenerated=false;
    this.isUnstructGenerated=false;
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file: File | null = files.item(i);
        if (file) {
          this.selectedFile.push(file);
        }
      }
    }
    console.log(this.selectedFile)
  }


  isUnStructured:boolean=false;
  unStructuredPath:string='';
  createSource(){
    this.loading=true;
    // this.selectedSource = ''; 
    // this.selectedFile=[];
    const formData = new FormData();
    for (let i = 0; i < this.selectedFile.length; i++) {
      // console.log(this.selectedFile[i])
      const file: File | null = this.selectedFile[i];
      try {
        if (file) {
          formData.append('files', file, file.name);
        }
      } catch (error) {
        console.error('Error appending file to FormData:', error);
      }
    }
    let files=formData;
      this.http.post('http://35.207.234.212:5000/upload_files', files)
        .subscribe((response:any) => {
          console.log(response);
          this.unStructuredPath=response;
        this.isUnStructured =true;
        this.loading=false;
        this.UnstructName=this.selectedFile;
        this.successMessage = "File Uploaded successfully!";
          setTimeout(() => {
            this.successMessage = null;
          }, 2000);
        },
        error => {
          this.loading=false;
          console.error(error);
        })
  }

isStructured:boolean=false;
  connectDB(){
    this.loading=true;
   let credentials=
        { "user": this.userName,
        "password": this.password,
        "host": this.hostName,
        "port": this.port,
        "database": this.database
        }
      this.http.post('http://35.207.234.212:5000/get_struct_schema',{ db_config :credentials})
      .subscribe(
        (data: any) => {
          console.log(data);
          this.isStructured=true;
          this.loading=false;
          this.structName.push(this.database);
          this.successMessage = "DB connected successfully!";
          setTimeout(() => {
            this.successMessage = null;
          }, 2000);
        }, 
        error => {
          this.loading=false;
          this.toastr.error(error);
          console.error(error);
        }) 
  }

  successMessage: string | null = null;

  isStuctGenerated:boolean=false;
  structureKg(){
    this.loading=true;
    this.http.get('http://35.207.234.212:5000/build_struct_kg')
      .subscribe(
        (data: any) => {
          console.log(data);
          this.loading=false;
          this.isStuctGenerated=true;
          this.successMessage = "Structured KG generated successfully!";
          setTimeout(() => {
            this.successMessage = null;
          }, 2000);
        },
        error=>{
          this.loading=false;
          this.toastr.error(error);
          console.error(error);
        })
    
  }

  next(){
    this.selectedSource='option2';
  }
  
  isUnstructGenerated:boolean=false;
  unStructureKg(){
    console.log(this.unStructuredPath);
    this.loading=true;
    this.http.post('http://35.207.234.212:5000/build_unstruct_kg',{"folder_path":this.unStructuredPath})
      .subscribe(
        (data: any) => {
          console.log(data);
          this.loading=false;
          this.isUnstructGenerated=true;
          this.successMessage = "Unstructured KG generated successfully!";
          setTimeout(() => {
            this.successMessage = null;
          }, 3500);
        },
        error=>{
          this.loading=false;
          this.toastr.error(error);
          console.error(error);
        })
  }

logs:any='';
  sendRequest(){
    this.loading1=true;
    const userQuestion = this.chatInput;
    this.chatMessages.push({ content: userQuestion, type: 'question' });
    this.chatInput = '';
    this.http.post('http://35.207.234.212:5000/reasoning_agent',{"query":userQuestion})
    .subscribe((res:any)=>{
      console.log(res);
      this.chatMessages.push({ content: res.response, type: 'response' });
      this.logs=res.agent_logs;
      this.loading1=false;
      
    },
    error =>{
      this.loading1=false;
      this.toastr.error(error.message);
    })
  }

  formatLogs(logs: string): string {
    return logs.replace(/\n/g, '<br>');
  }

  isUserMessage(message: any): boolean {
    return message && message.type === 'user';
  }

  isApiMessage(message: any): boolean {
    return message && message.type === 'api';
  }  

}
