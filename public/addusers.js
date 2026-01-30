const addUser_btn=document.getElementById('add_user');
const modal=document.getElementById('Modal');
const closeModal=document.getElementById('closeModal');
const modalTitle=document.getElementsByClassName('modal-title')[0];
import {Element} from './create_element.js';

addUser_btn.addEventListener('click', async function(){
modal.id='addUsers';
const form =modal.querySelector('#addUserForm');
form.setAttribute('action','/users/add');
form.setAttribute('method','POST');
const Btn=new Element('button',{type:'submit', id:'submitBtn', class:'btn btn-dark mt-3'});
const btn=Btn.createbtn('Add User');
modalTitle.textContent='Add User';
modal.style.display='flex';
if(!form.querySelector('#submitBtn')){
    form.appendChild(btn);
}
// Handle user submission
form.addEventListener('submit', async function(e){
    e.preventDefault();
    const email=modal.querySelector('#emailid').value;
    const password=modal.querySelector('#passwords').value;
    const roleid=modal.querySelector('#role_name').value; 
     const userData={email,password,roleid};  
    const res=await fetch('/user/add',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(userData)
    });
    const data=await res.json();
    if(res.ok && data.message){
        modal.style.display='none';
        form.reset();
        Btn.alertmsg(data.message,'success')
        
    }
    else if (res.status === 400) {
     
    // Validation error
    Btn.alertmsg(data.message, 'danger', btn);
}
else if (res.status === 409 && data.message) {
    // Duplicate user
    Btn.alertmsg(data.message, 'danger', btn);
}
    else{
        const errorMsg = data && data.message ? data.message : 'Error adding user.';
        Btn.alertmsg(errorMsg,'danger')
    }       
   
    })



})

closeModal.addEventListener('click', function(){
    modal.style.display='none';
});


