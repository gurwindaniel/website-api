document.getElementById('login').addEventListener('submit', async function(e){
    e.preventDefault();
    const email=document.getElementById('email').value.trim();
    const password=document.getElementById('password').value.trim();
    const roleid=document.getElementById('role_id').value.trim();
    const loginData={email,password,roleid};
    const res=await fetch('/login',{
        method:'POST',
        headers:{ 'Content-Type': 'application/json' },
        body:JSON.stringify(loginData)
    });

    const data = await res.json();
})       