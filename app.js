document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const mainMenu = document.getElementById('mainMenu');
  const treeMenu = document.getElementById('treeMenu');
  const menuItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.page-section');
  const backToMainBtn = document.getElementById('backToMainBtn');
  const treeItems = document.querySelectorAll('.tree-item');

  // Space Unit Views
  const unitDefaultView = document.getElementById('unit-default-view');
  const unitAScanView = document.getElementById('unit-a-scan-view');
  const roomDetailView = document.getElementById('room-detail-view');
  
  // A Unit Scan Elements
  const blueprintScanBtn = document.getElementById('blueprintScanBtn');
  const scanningProgress = document.getElementById('scanningProgress');
  const scanProgressBar = document.getElementById('scanProgressBar');
  const blueprintMap = document.getElementById('blueprintMap');
  const scanSteps = scanningProgress ? scanningProgress.querySelectorAll('li') : [];

  // Room Markers
  const roomMarkers = document.querySelectorAll('.room-marker');
  const backToMapBtn = document.getElementById('backToMapBtn');

  // 1. Menu Navigation
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = item.getAttribute('data-target');

      if (targetId === 'unit-space') {
        // Switch sidebar to Tree Menu
        mainMenu.classList.add('hidden');
        treeMenu.classList.remove('hidden');
      }

      // Update active menu highlights
      menuItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');

      // Update active section
      sections.forEach(sec => {
        if (sec.id === targetId) sec.classList.add('active');
        else sec.classList.remove('active');
        sec.classList.remove('hidden'); 
        if(sec.id !== targetId) sec.classList.add('hidden');
      });
    });
  });

  // 2. Tree Menu Logic
  if (backToMainBtn) {
    backToMainBtn.addEventListener('click', () => {
      treeMenu.classList.add('hidden');
      mainMenu.classList.remove('hidden');
      
      // Reset Tree selection
      treeItems.forEach(t => t.classList.remove('active'));
      
      // Show default unit view
      unitDefaultView.classList.remove('hidden');
      unitAScanView.classList.add('hidden');
      roomDetailView.classList.add('hidden');
    });
  }

  // Global variable to store current floor image
  let currentScanImageSrc = 'public/2d_scan.jpg';

  // Toggle tree children
  const hasChildrenItems = document.querySelectorAll('.has-children');
  hasChildrenItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      item.classList.toggle('open');
      const childrenContainer = item.nextElementSibling;
      if (childrenContainer && childrenContainer.classList.contains('tree-children')) {
        childrenContainer.classList.toggle('hidden');
      }
    });
  });

  treeItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.classList.contains('has-children') || (item.classList.contains('child') && !item.classList.contains('floor-item'))) {
        return; // Handled by toggle logic
      }
      
      e.preventDefault();
      treeItems.forEach(t => t.classList.remove('active'));
      item.classList.add('active');

      const unit = item.getAttribute('data-unit');
      const floor = item.getAttribute('data-floor');

      if (floor) {
        currentFloor = floor;
        unitDefaultView.classList.add('hidden');
        roomDetailView.classList.add('hidden');
        unitAScanView.classList.remove('hidden');

        // Update target image src
        if (floor === '1') currentScanImageSrc = 'public/A_main_1F.jpg';
        if (floor === '2') currentScanImageSrc = 'public/A_main_2F.jpg';

        // Update Scan title
        const mapTitle = unitAScanView.querySelector('h3');
        if (mapTitle) mapTitle.innerHTML = `<i class="ri-map-2-line"></i> A부대 분청 ${floor}층 전개도`;

        // Reset scan state
        if (blueprintScanBtn) blueprintScanBtn.classList.remove('hidden');
        if (scanningProgress) scanningProgress.classList.add('hidden');
        if (blueprintMap) blueprintMap.classList.add('hidden');
      } else if (unit === 'B') {
        alert('B부대는 접근이 제한된 구역입니다.');
      }
    });
  });

  // 3. Blueprint Scan Animation
  if (blueprintScanBtn) {
    blueprintScanBtn.addEventListener('click', () => {
      blueprintScanBtn.classList.add('hidden');
      scanningProgress.classList.remove('hidden');

      // Step 1
      scanProgressBar.style.width = '20%';

      // Step 2
      setTimeout(() => {
        scanProgressBar.style.width = '60%';
        scanSteps[1].classList.remove('pending');
        scanSteps[1].classList.add('active');
        scanSteps[1].innerHTML = '<i class="ri-checkbox-circle-line"></i> 2D 평면도 렌더링 완료';
        scanSteps[2].innerHTML = '<i class="ri-loader-4-line spin"></i> 공간 세그멘테이션 진행 중...';
      }, 1500);

      // Step 3
      setTimeout(() => {
        scanProgressBar.style.width = '100%';
        scanSteps[2].classList.remove('pending');
        scanSteps[2].classList.add('active');
        scanSteps[2].innerHTML = '<i class="ri-checkbox-circle-line"></i> 공간 세그멘테이션 완료';
        
        setTimeout(() => {
          scanningProgress.classList.add('hidden');
          blueprintMap.classList.remove('hidden');
          
          const bpImg = blueprintMap.querySelector('.blueprint-img');
          if (bpImg) bpImg.src = currentScanImageSrc;
        }, 800);
      }, 3500);
    });
  }

  // 3D Convert Logic
  const convert3dBtn = document.getElementById('convert3dBtn');
  if (convert3dBtn) {
    convert3dBtn.addEventListener('click', () => {
      if (blueprintMap) {
        const bpImg = blueprintMap.querySelector('.blueprint-img');
        if (bpImg) {
          if (currentFloor === '1') bpImg.src = 'public/A_main_1F_3D.jpg';
          if (currentFloor === '2') bpImg.src = 'public/A_main_2F_3D.jpg';
        }
      }
    });
  }

  // 4. Room Detail Marker Click
  const roomUploadArea = document.getElementById('roomUploadArea');
  const roomProcessingPanel = document.getElementById('roomProcessingPanel');
  const roomProgressBar = document.getElementById('roomProgressBar');
  const roomResultView = document.getElementById('roomResultView');
  const roomEditorView = document.getElementById('roomEditorView');
  const roomSteps = roomProcessingPanel ? roomProcessingPanel.querySelectorAll('.process-steps li') : [];

  roomMarkers.forEach(marker => {
    marker.addEventListener('click', () => {
      unitAScanView.classList.add('hidden');
      roomDetailView.classList.remove('hidden');
      
      const room = marker.getAttribute('data-room');
      const titleEl = document.getElementById('roomTitle');
      if(titleEl) {
        if(room === 'living1') titleEl.textContent = '생활관 1';
        if(room === 'cafe') titleEl.textContent = '병영식당';
      }

      // Reset room detail view to upload state
      if (roomUploadArea) roomUploadArea.classList.remove('hidden');
      if (roomProcessingPanel) roomProcessingPanel.classList.add('hidden');
      if (roomResultView) roomResultView.classList.add('hidden');
      if (roomEditorView) roomEditorView.classList.add('hidden');
    });
  });

  if (roomUploadArea) {
    roomUploadArea.addEventListener('click', () => {
      roomUploadArea.classList.add('hidden');
      roomProcessingPanel.classList.remove('hidden');

      // Step 1
      roomProgressBar.style.width = '20%';

      // Step 2
      setTimeout(() => {
        roomProgressBar.style.width = '60%';
        roomSteps[1].classList.remove('pending');
        roomSteps[1].classList.add('active');
        roomSteps[1].innerHTML = '<i class="ri-checkbox-circle-line"></i> 2D 도면 추출 및 벽 생성 완료';
        roomSteps[2].innerHTML = '<i class="ri-loader-4-line spin"></i> 3D 객체 인테리어 자동 배치 중...';
      }, 2000);

      // Step 3
      setTimeout(() => {
        roomProgressBar.style.width = '100%';
        roomSteps[2].classList.remove('pending');
        roomSteps[2].classList.add('active');
        roomSteps[2].innerHTML = '<i class="ri-checkbox-circle-line"></i> 3D 객체 인테리어 자동 배치 완료';
        
        setTimeout(() => {
          roomProcessingPanel.classList.add('hidden');
          roomResultView.classList.remove('hidden');
        }, 1000);
      }, 4500);
    });
  }

  // 3D Editor Enter/Exit logic
  const enter3dEditorBtn = document.getElementById('enter3dEditorBtn');
  const exitEditorBtn = document.getElementById('exitEditorBtn');

  if (enter3dEditorBtn) {
    enter3dEditorBtn.addEventListener('click', () => {
      roomResultView.classList.add('hidden');
      roomEditorView.classList.remove('hidden');
    });
  }

  if (exitEditorBtn) {
    exitEditorBtn.addEventListener('click', () => {
      roomEditorView.classList.add('hidden');
      roomResultView.classList.remove('hidden');
    });
  }

  if (backToMapBtn) {
    backToMapBtn.addEventListener('click', () => {
      roomDetailView.classList.add('hidden');
      unitAScanView.classList.remove('hidden');
    });
  }

  // 5. Generator Object Upload Simulation
  const objectUploadArea = document.getElementById('objectUploadArea');
  const objectProcessingPanel = document.getElementById('objectProcessingPanel');
  const objProgressBar = document.getElementById('objProgressBar');
  const objSteps = objectProcessingPanel ? objectProcessingPanel.querySelectorAll('.process-steps li') : [];

  if (objectUploadArea) {
    objectUploadArea.addEventListener('click', () => {
      objectUploadArea.classList.add('hidden');
      objectProcessingPanel.classList.remove('hidden');

      objProgressBar.style.width = '15%';
      
      setTimeout(() => {
        objProgressBar.style.width = '60%';
        objSteps[1].classList.remove('pending');
        objSteps[1].classList.add('active');
        objSteps[1].innerHTML = '<i class="ri-checkbox-circle-line"></i> 메쉬 생성 및 텍스처링 완료';
        objSteps[2].innerHTML = '<i class="ri-loader-4-line spin"></i> 3D 모델 최적화 진행 중...';
      }, 2000);

      setTimeout(() => {
        objProgressBar.style.width = '100%';
        objSteps[2].classList.remove('pending');
        objSteps[2].classList.add('active');
        objSteps[2].innerHTML = '<i class="ri-checkbox-circle-line"></i> 3D 모델 완성';
      }, 4000);
    });
  }

  // Gallery Select
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      galleryItems.forEach(g => g.classList.remove('selected'));
      item.classList.add('selected');
      const tableCells = document.querySelectorAll('.estimate-table .cell');
      tableCells.forEach(cell => {
        cell.style.opacity = '0.5';
        setTimeout(() => cell.style.opacity = '1', 300);
      });
    });
  });

  // Theme Toggle listener
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('change', (e) => {
      if (e.target.checked) document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
    });
  }
});
