document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  function showError(msg) {
    let err = document.getElementById('project-error');
    if (!err) {
      err = document.createElement('div');
      err.id = 'project-error';
      err.style.color = '#ff6b6b';
      err.style.fontFamily = 'monospace';
      err.style.margin = '32px';
      document.body.prepend(err);
    }
    err.textContent = msg;
  }

  if (!window.PROJECTS) {
    showError('Ошибка: window.PROJECTS не определён. Проверьте подключение projects.js');
  } else {
    const project = window.PROJECTS.find(p => p.id === projectId);
    if (project) {
      document.title = project.title + ' — otdel33';
      document.getElementById('project-title-h1').textContent = project.title;
      document.getElementById('project-description').innerHTML = project.about || project.description;
      // Авторы
      const authorsSection = document.getElementById('project-authors-section');
      let authorBlocks = [];
      if (project.authors && project.authors.length > 0) {
        authorBlocks = project.authors.map(author => `
          <div class="project-author-block">
            <div class="project-author-role">[${author.role}]</div>
            <div class="project-author-names">${author.people.join('<br>')}</div>
          </div>
        `);
        while (authorBlocks.length < 4) {
          authorBlocks.push('<div class="project-author-block"></div>');
        }
        authorsSection.innerHTML = authorBlocks.join('');
      } else {
        authorsSection.innerHTML = '';
      }
      // Теги
      document.getElementById('project-tags').innerHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join(' ');
      // Видео
      if (project.video) {
        document.getElementById('main-video-source').src = project.video;
        document.getElementById('main-video').load();
      }
      // Галерея
      const gallerySection = document.getElementById('project-gallery');
      if (project.gallery && Array.isArray(project.gallery)) {
        gallerySection.innerHTML = project.gallery.map(row => {
          const cols = row.length;
          return `<div class="gallery-row" style="grid-template-columns: repeat(${cols}, 1fr);">` +
            row.map(item => {
              if (item.type === 'image') {
                return `<div class="gallery-item"><img src="${item.src}" alt="${item.alt || ''}"></div>`;
              } else if (item.type === 'video') {
                return `<div class="gallery-item"><video src="${item.src}" controls poster="${item.poster || ''}"></video></div>`;
              } else if (item.type === 'gif') {
                return `<div class="gallery-item"><img src="${item.src}" alt="${item.alt || ''}"></div>`;
              } else {
                return '';
              }
            }).join('') +
            '</div>';
        }).join('');
      } else {
        gallerySection.innerHTML = '';
      }
    } else {
      showError('Проект не найден. Проверьте параметр id в адресе и наличие такого id в projects.js');
      document.title = 'Проект не найден — otdel33';
      document.getElementById('project-title-h1').textContent = 'Проект не найден';
      document.getElementById('project-description').textContent = '';
      document.getElementById('project-tags').innerHTML = '';
    }
  }
});
