class Element{
    constructor(type, attributes = {}, children = []) {
        this.type = type;
        this.attributes = attributes;
        this.children = children;
    }
    createbtn(textContent){
        const btn = document.createElement(this.type);
        for (const [key, value] of Object.entries(this.attributes)) {
            btn.setAttribute(key, value);
        }
        btn.textContent = textContent;
        return btn;
    }
alertmsg(message, type = 'warning') {
    // Find the navbar (assumes it has id="navbar" or class="navbar")
    const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    if (!navbar) return;

    // Remove any existing alert
    const oldAlert = document.getElementById('customAlert');
    if (oldAlert) oldAlert.remove();

    // Create alert div with Bootstrap classes
    const alertDiv = document.createElement(this.type);
    alertDiv.id = 'customAlert';
    alertDiv.className = `alert alert-${type} alert-dismissible fade show w-100`;
    alertDiv.role = 'alert';
    alertDiv.textContent = message;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('data-bs-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Close');
    alertDiv.appendChild(closeBtn);

    // Insert after navbar
    navbar.parentNode.insertBefore(alertDiv, navbar.nextSibling);
}
}

export {Element};