document.addEventListener('DOMContentLoaded', function(){
  const el = document.getElementById('construction-message');
  if(el){
    el.textContent = 'Página em construção — volta em breve!';
    el.classList.add('text-warning');
  }
  showAlert('info', 'Aviso: funcionalidades em desenvolvimento.', {dismissible: true, autoClose: 7000});

});

/**
 * showAlert - cria e insere um alerta Bootstrap em #alert-area
 * @param {string} type - 'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'
 * @param {string} message - texto do alerta (HTML permitido)
 * @param {object} opts - { dismissible: boolean, autoClose: ms|null }
 */
function showAlert(type, message, opts){
  opts = opts || {};
  const area = document.getElementById('alert-area');
  if(!area) return;

  const wrapper = document.createElement('div');
  const dismissClass = opts.dismissible ? ' alert-dismissible fade show' : '';
  wrapper.innerHTML = `<div class="alert alert-${type}${dismissClass}" role="alert">${message}${opts.dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : ''}</div>`;
  area.appendChild(wrapper);

  if(opts.autoClose && typeof opts.autoClose === 'number'){
    setTimeout(()=>{
      const alertEl = wrapper.querySelector('.alert');
      if(alertEl){
        try{
          const bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
          bsAlert.close();
        }catch(e){
          wrapper.remove();
        }
      }
    }, opts.autoClose);
  }
}
