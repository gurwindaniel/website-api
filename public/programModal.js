// Handles viewing and editing program details in a popup modal

document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('programsTable');
    if (!table) return;

    table.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');
        if (e.target.classList.contains('view-btn')) {
            // Fetch and show details in modal
            const res = await fetch(`/programs/${id}`);
            const data = await res.json();
            showProgramModal(data, false);
        } else if (e.target.classList.contains('edit-btn')) {
            // Fetch and show details in modal (editable)
            const res = await fetch(`/programs/${id}`);
            const data = await res.json();
            showProgramModal(data, true);
        }
    });
});

function showProgramModal(data, editable) {
    // Create modal HTML if not exists
    let modal = document.getElementById('programModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'programModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <form id="editProgramForm" enctype="multipart/form-data" method="POST">
              <div class="modal-header">
                <h5 class="modal-title">Program Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input type="text" class="form-control" name="title" id="modalTitle" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Icon</label><br>
                  <img id="modalIcon" src="" alt="Icon" style="max-width:100px;max-height:100px;display:block;margin-bottom:10px;">
                  <input type="file" class="form-control" name="icon" id="modalIconInput" accept="image/*">
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" name="description" id="modalDescription" rows="3" required></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary" id="modalSaveBtn">Save changes</button>
              </div>
            </form>
          </div>
        </div>`;
        document.body.appendChild(modal);
    }
    // Set values
    document.getElementById('modalTitle').value = data.title;
    document.getElementById('modalDescription').value = data.description;
    document.getElementById('modalIcon').src = data.icon ? `data:image/png;base64,${data.icon}` : '';
    document.getElementById('modalIconInput').value = '';
    // Enable/disable fields
    document.getElementById('modalTitle').readOnly = !editable;
    document.getElementById('modalDescription').readOnly = !editable;
    document.getElementById('modalIconInput').disabled = !editable;
    document.getElementById('modalSaveBtn').style.display = editable ? '' : 'none';
    // Set form action
    document.getElementById('editProgramForm').action = `/programs/${data.id}/edit`;

    // Remove previous submit event to avoid duplicates
    const form = document.getElementById('editProgramForm');
    form.onsubmit = null;

    if (editable) {
        form.onsubmit = async function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            // Only append file if selected
            const iconInput = document.getElementById('modalIconInput');
            if (iconInput.files.length === 0) {
                formData.delete('icon');
            }
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    // Optionally handle errors here
                    location.reload();
                }
            } catch (err) {
                alert('Error updating program.');
            }
        };
    }
    // Show modal (Bootstrap 5)
    var bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}
