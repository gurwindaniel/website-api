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

// Handle row click to show user details in modal
document.addEventListener('DOMContentLoaded', function() {
    const table = document.querySelector('table.table');
    if (table) {
        table.addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (!row || row.parentElement.tagName !== 'TBODY') return;
            // Get values from row
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return; // skip if not a user row
            const email = cells[0].textContent.trim();
            const rolename = cells[1].textContent.trim();

            // Show modal and fill form
            modal.id = 'viewUser';
            modalTitle.textContent = 'User Details';
            modal.style.display = 'flex';
            const form = modal.querySelector('#addUserForm');
            form.setAttribute('action', '#');
            form.setAttribute('method', 'GET');
            // Fill values
            form.querySelector('#emailid').value = email;
            form.querySelector('#passwords').value = '';
            form.querySelector('#passwords').setAttribute('placeholder', 'Hidden');
            // Set role select
            const roleSelect = form.querySelector('#role_name');
            for (let i = 0; i < roleSelect.options.length; i++) {
                if (roleSelect.options[i].textContent.trim() === rolename) {
                    roleSelect.selectedIndex = i;
                    break;
                }
            }
            // Remove submit button if present
            const submitBtn = form.querySelector('#submitBtn');
            if (submitBtn) submitBtn.remove();
            // Make fields readonly
            form.querySelector('#emailid').setAttribute('readonly', true);
            form.querySelector('#passwords').setAttribute('readonly', true);
            roleSelect.setAttribute('disabled', true);
        });
    }
});


