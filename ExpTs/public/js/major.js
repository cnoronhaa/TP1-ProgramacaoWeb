document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('delete-modal');
  const confirmBtn = document.getElementById('confirm-delete');
  const cancelBtn = document.getElementById('cancel-delete');
  let idToDelete = null;

  document.querySelectorAll('.btn-delete-major').forEach((btn) => {
    btn.addEventListener('click', () => {
      idToDelete = btn.dataset.id;
      modal.classList.add('is-visible');
    });
  });

  cancelBtn.addEventListener('click', () => {
    idToDelete = null;
    modal.classList.remove('is-visible');
  });

  confirmBtn.addEventListener('click', async () => {
    if (!idToDelete) return;

    try {
      const response = await fetch(`/major/${idToDelete}/delete`, {
        method: 'POST'
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Não foi possível excluir o curso.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir o curso.');
    } finally {
      modal.classList.remove('is-visible');
      idToDelete = null;
    }
  });
});