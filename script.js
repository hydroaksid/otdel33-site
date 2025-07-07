// Функция для перестраивания нестандартной сетки при фильтрации
function rebuildGrid() {
  const visibleItems = document.querySelectorAll('.gallery-item:not(.hidden)');
  const totalVisible = visibleItems.length;
  
  // Схема 2-3-2 повторяется каждые 7 элементов
  const baseScheme = [
    { start: 1, end: 3 }, // элемент 1: занимает 2 колонки
    { start: 3, end: 4 }, // элемент 2: занимает 1 колонку
    { start: 1, end: 2 }, // элемент 3: занимает 1 колонку
    { start: 2, end: 3 }, // элемент 4: занимает 1 колонку
    { start: 3, end: 4 }, // элемент 5: занимает 1 колонку
    { start: 1, end: 2 }, // элемент 6: занимает 1 колонку
    { start: 2, end: 4 }  // элемент 7: занимает 2 колонки
  ];
  
  visibleItems.forEach((item, index) => {
    const cycleIndex = index % 7; // Определяем позицию в цикле (0-6)
    const scheme = baseScheme[cycleIndex];
    item.style.gridColumn = `${scheme.start} / ${scheme.end}`;
  });
}

// Функция для сброса сетки (показать все элементы)
function resetGrid() {
  const allItems = document.querySelectorAll('.gallery-item');
  allItems.forEach(item => {
    item.style.gridColumn = 'auto';
  });
}

// Функция для плавной анимации элементов
function animateItems(items, show, callback) {
  items.forEach((item, index) => {
    if (show) {
      // Показываем элемент
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        item.classList.remove('hidden');
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      }, index * 50); // Небольшая задержка для каскадного эффекта
    } else {
      // Скрываем элемент
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        item.classList.add('hidden');
      }, 300); // Ждём завершения анимации
    }
  });
  
  // Вызываем callback после завершения анимации
  setTimeout(callback, show ? items.length * 50 + 300 : 300);
}

// Обновляем функцию фильтрации
function initFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const selectedTag = this.textContent;
      
      // Прокрутка к разделу проектов/галерее с учётом высоты header
      const gallery = document.querySelector('.gallery');
      if (gallery) {
        const header = document.querySelector('.header');
        const filters = document.querySelector('.filters');
        const headerHeight = header ? header.offsetHeight : 54;
        const filtersHeight = filters ? filters.offsetHeight : 0;
        const galleryTop = gallery.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: galleryTop - headerHeight - filtersHeight - 8,
          behavior: 'smooth'
        });
      } else {
        const section = document.getElementById('projects-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Если нажали на уже активную кнопку - сбрасываем фильтр
      if (this.classList.contains('active')) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        galleryItems.forEach(item => {
          item.classList.remove('hidden');
        });
        rebuildGrid(); // Применяем схему 2-3-2 ко всем элементам
        return;
      }
      
      // Убираем активный класс у всех кнопок
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Добавляем активный класс к нажатой кнопке
      this.classList.add('active');
      
      // Фильтруем обложки
      galleryItems.forEach(item => {
        const itemTags = item.getAttribute('data-tags').split(',');
        if (itemTags.includes(selectedTag)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
      
      // Перестраиваем сетку для видимых элементов
      setTimeout(rebuildGrid, 10);
    });
  });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initFiltering();
  
  // Применяем схему 2-3-2 к исходной сетке
  rebuildGrid();

  // --- Подсветка тегов при наведении на gallery-item ---
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  galleryItems.forEach(item => {
    item.onmouseenter = function() {
      const itemTags = (item.getAttribute('data-tags') || '').split(',');
      filterButtons.forEach(btn => {
        if (itemTags.includes(btn.textContent)) {
          btn.classList.add('tag-hovered');
        }
      });
    };
    item.onmouseleave = function() {
      filterButtons.forEach(btn => btn.classList.remove('tag-hovered'));
    };
  });

  // Скроллим к проектам только если переход был по кнопке (есть флаг в localStorage)
  if (
    window.location.hash === '#projects-section' &&
    localStorage.getItem('scrollToProjects') === '1'
  ) {
    setTimeout(() => {
      const section = document.getElementById('projects-section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
      localStorage.removeItem('scrollToProjects');
    }, 100);
  }
});

// Функция для показа/скрытия светлой полосы
function checkHeaderVisibility() {
  const projects = document.getElementById('projects-section');
  const header = projects.querySelector('.header');
  const rect = projects.getBoundingClientRect();
  if (rect.top <= 54 && rect.bottom > 54) {
    header.classList.add('header-visible');
  } else {
    header.classList.remove('header-visible');
  }
}

// Генерация тегов и обложек из window.PROJECTS
function renderGalleryAndTags() {
  const gallery = document.querySelector('.gallery');
  const filters = document.querySelector('.filters');
  if (!gallery || !filters || !window.PROJECTS) return;

  // Собираем все уникальные теги
  const allTags = Array.from(new Set(window.PROJECTS.flatMap(p => p.tags)));

  // Генерируем кнопки тегов
  filters.innerHTML = allTags.map(tag => `<button class="filter-btn">${tag}</button>`).join('');

  // Генерируем обложки
  gallery.innerHTML = window.PROJECTS.map(project => `
    <div class="gallery-item" data-tags="${project.tags.join(',')}">
      <div class="gallery-cover">
        <img src="${project.cover}" alt="${project.title}">
      </div>
      <div class="gallery-item-info">
        <span class="title">${project.title}</span>
        <span class="description">${project.description}</span>
      </div>
      <a href="project.html?id=${project.id}" class="gallery-link" tabindex="-1" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;"></a>
    </div>
  `).join('');

  // После генерации обязательно инициализируем фильтрацию и сетку
  initFiltering();
  rebuildGrid();

  // --- Подсветка тегов при наведении на gallery-item ---
  // Сначала убираем старые обработчики (если функция вызывается повторно)
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  galleryItems.forEach(item => {
    item.onmouseenter = function() {
      const itemTags = (item.getAttribute('data-tags') || '').split(',');
      filterButtons.forEach(btn => {
        if (itemTags.includes(btn.textContent)) {
          btn.classList.add('tag-hovered');
        }
      });
    };
    item.onmouseleave = function() {
      filterButtons.forEach(btn => btn.classList.remove('tag-hovered'));
    };
  });
}

// Вызов генерации при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderGalleryAndTags);
} else {
  renderGalleryAndTags();
}

function goToProjects() {
  if (
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname === ''
  ) {
    document.getElementById('projects-section').scrollIntoView({ behavior: 'smooth' });
  } else {
    localStorage.setItem('scrollToProjects', '1');
    window.location.href = 'index.html#projects-section';
  }
}

function goToIntro() {
  if (
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname === ''
  ) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.href = 'index.html';
  }
}
