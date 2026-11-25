import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';

// --- INITIAL DEFAULT SAMPLE DATA ---
const DEFAULT_MEMBERS = [
  // Paternal Grandparents
  { id: 'p_gpa', branch: 'paternal', tier: 'grandparents', role: 'Paternal Grandfather', name: 'Arthur Vance', maidenName: '', birth: '1938', death: '2015', origin: 'Edinburgh, Scotland', bio: 'Master carpenter and clan storyteller who passed down a love for craftsmanship.', photo: '' },
  { id: 'p_gma', branch: 'paternal', tier: 'grandparents', role: 'Paternal Grandmother', name: 'Eleanor Vance', maidenName: 'Campbell', birth: '1942', death: '', origin: 'Highlands, Scotland', bio: 'Pianist, master gardener, and keeper of early family photo albums.', photo: '' },
  
  // Father & Paternal Uncles/Aunts
  { id: 'p_uncle1', branch: 'paternal', tier: 'uncles', role: 'Paternal Uncle', name: 'Robert Vance', maidenName: '', birth: '1966', death: '', origin: 'Glasgow, UK', bio: 'Architect and avid mountain hiker.', photo: '' },
  { id: 'father', branch: 'paternal', tier: 'parents', role: 'Father', name: 'Edward Vance', maidenName: '', birth: '1968', death: '', origin: 'London, UK', bio: 'Civil engineer with a passion for history and woodworking.', photo: '' },
  { id: 'p_aunt1', branch: 'paternal', tier: 'uncles', role: 'Paternal Aunt', name: 'Margaret Vance', maidenName: '', birth: '1972', death: '', origin: 'Edinburgh, UK', bio: 'Teacher and local history researcher.', photo: '' },

  // Maternal Grandparents
  { id: 'm_gpa', branch: 'maternal', tier: 'grandparents', role: 'Maternal Grandfather', name: 'Charles Montgomery', maidenName: '', birth: '1940', death: '2019', origin: 'Dublin, Ireland', bio: 'Botanist and nature reserve founder.', photo: '' },
  { id: 'm_gma', branch: 'maternal', tier: 'grandparents', role: 'Maternal Grandmother', name: 'Clara Montgomery', maidenName: 'O\'Connor', birth: '1943', death: '', origin: 'Galway, Ireland', bio: 'Artist and watercolor landscape painter.', photo: '' },

  // Mother & Maternal Uncles/Aunts
  { id: 'm_aunt1', branch: 'maternal', tier: 'uncles', role: 'Maternal Aunt', name: 'Fiona Montgomery', maidenName: '', birth: '1969', death: '', origin: 'Dublin, Ireland', bio: 'Journalist and author.', photo: '' },
  { id: 'mother', branch: 'maternal', tier: 'parents', role: 'Mother', name: 'Grace Vance', maidenName: 'Montgomery', birth: '1971', death: '', origin: 'Dublin, Ireland', bio: 'Landscape designer and community garden coordinator.', photo: '' },
  { id: 'm_uncle1', branch: 'maternal', tier: 'uncles', role: 'Maternal Uncle', name: 'Liam Montgomery', maidenName: '', birth: '1975', death: '', origin: 'Cork, Ireland', bio: 'Marine biologist and ocean photographer.', photo: '' },

  // Self & Siblings & Spouse
  { id: 'sib1', branch: 'self', tier: 'siblings', role: 'Sister', name: 'Charlotte Vance', maidenName: '', birth: '1995', death: '', origin: 'London, UK', bio: 'Graphic designer.', photo: '' },
  { id: 'self', branch: 'self', tier: 'siblings', role: 'You (Self)', name: 'Julian Vance', maidenName: '', birth: '1997', death: '', origin: 'London, UK', bio: 'Software developer and family archive recorder.', photo: '' },
  { id: 'spouse', branch: 'self', tier: 'spouse', role: 'Spouse / Partner', name: 'Elena Vance', maidenName: 'Rios', birth: '1998', death: '', origin: 'Madrid, Spain', bio: 'Architect and documentary photographer.', photo: '' },
  { id: 'sib2', branch: 'self', tier: 'siblings', role: 'Brother', name: 'Oliver Vance', maidenName: '', birth: '2001', death: '', origin: 'London, UK', bio: 'Musician and sound designer.', photo: '' },

  // Next Generation
  { id: 'child1', branch: 'children', tier: 'children', role: 'Daughter', name: 'Sophia Vance', maidenName: '', birth: '2022', death: '', origin: 'London, UK', bio: 'Loves storybooks and nature walks.', photo: '' },
  { id: 'child2', branch: 'children', tier: 'children', role: 'Son', name: 'Leo Vance', maidenName: '', birth: '2025', death: '', origin: 'London, UK', bio: 'Bright and energetic explorer.', photo: '' }
];

const DEFAULT_HISTORIES = {
  paternal: `FATHER'S FAMILY ORIGINS & HERITAGE
Ancestral Roots & Clan Story:
The Vance family lineage originates from the coastal Scottish Borders and Highlands. Known historically for timber craftsmanship and stonemasonry, the family later settled near Edinburgh in the early 20th century.

Key Family Values & Traditions:
Hard work, musical gatherings, annual autumn gatherings, and preserving hand-built woodcrafts passed down through generations.`,
  
  maternal: `MOTHER'S FAMILY ORIGINS & HERITAGE
Ancestral Maiden Lineage & Story:
The Montgomery family traces its roots back to County Galway and Dublin, Ireland. Deeply connected to botany, agriculture, and fine arts, the maternal line preserves stories of botanical illustration and maritime adventures.

Key Family Traditions:
Sunday family meals, keeping handwritten recipe journals, watercolor painting, and honoring festive holiday gatherings.`,

  union: `PARENTS' UNION & COMBINED HOUSEHOLD LEGACY
How Both Families Came Together:
Edward and Grace met during a university botanical architectural exhibit in 1991. They were married in 1994 in Dublin before settling down in London to raise their family, blending Scottish and Irish heritage into a warm, supportive home.`
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // --- STATE MANAGEMENT ---
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('family_tree_members');
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch (e) {
      return DEFAULT_MEMBERS;
    }
  });

  const [histories, setHistories] = useState(() => {
    try {
      const saved = localStorage.getItem('family_tree_histories');
      return saved ? JSON.parse(saved) : DEFAULT_HISTORIES;
    } catch (e) {
      return DEFAULT_HISTORIES;
    }
  });

  // Active View Tab: 'diagram' | 'history' | 'directory'
  const [activeTab, setActiveTab] = useState('diagram');

  // Zoom and Pan Controls for Diagram Canvas
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Selected Member for Slide-Over Modal Editing
  const [editingMember, setEditingMember] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Dynamic SVG Line Coordinates
  const [lines, setLines] = useState([]);

  // Toast / Notification Message State
  const [toast, setToast] = useState(null);

  // Print mode: 0 = off, otherwise page height in px (1 = measuring)
  const PRINT_WIDTH = 1500;
  const [printSize, setPrintSize] = useState(0);

  // First-run help banner (dismissal remembered in this browser)
  const [showHint, setShowHint] = useState(() => {
    try { return localStorage.getItem('family_tree_hint_dismissed') !== '1'; } catch (e) { return true; }
  });
  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem('family_tree_hint_dismissed', '1'); } catch (e) { /* ignore */ }
  };

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    try {
      localStorage.setItem('family_tree_members', JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
      showNotification('Could not save in this browser (storage full?). Use Export Backup to keep a copy.');
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('family_tree_histories', JSON.stringify(histories));
    } catch (e) {
      console.error('Failed to save histories to localStorage', e);
      showNotification('Could not save in this browser (storage full?). Use Export Backup to keep a copy.');
    }
  }, [histories]);

  // --- SVG CONNECTOR LINES CALCULATION ---
  const recalculateLines = useCallback(() => {
    if (!canvasRef.current || activeTab !== 'diagram') return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const getCoords = (id) => {
      const el = document.getElementById(`card-${id}`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: (rect.left + rect.width / 2 - canvasRect.left) / zoom,
        y: (rect.top + rect.height / 2 - canvasRect.top) / zoom,
        top: (rect.top - canvasRect.top) / zoom,
        bottom: (rect.bottom - canvasRect.top) / zoom,
        left: (rect.left - canvasRect.left) / zoom,
        right: (rect.right - canvasRect.left) / zoom,
      };
    };

    const newLines = [];

    // 1. Paternal Grandparents -> Father & Uncles
    const pGpa = getCoords('p_gpa');
    const pGma = getCoords('p_gma');
    const father = getCoords('father');
    const pUncles = members
      .filter((m) => m.branch === 'paternal' && m.tier === 'uncles')
      .map((m) => getCoords(m.id))
      .filter(Boolean);

    if (father && (pGpa || pGma)) {
      const gpX = pGpa && pGma ? (pGpa.x + pGma.x) / 2 : (pGpa || pGma).x;
      const gpY = pGpa && pGma ? Math.max(pGpa.bottom, pGma.bottom) : (pGpa || pGma).bottom;
      
      // Line from Paternal Grandparents down to junction bar
      const pMidY = gpY + 24;
      newLines.push({ id: 'p-gp-stem', path: `M ${gpX} ${gpY} L ${gpX} ${pMidY}` });

      // Horizontal connector across father and paternal aunts/uncles
      const pTargets = [father, ...pUncles];
      if (pTargets.length > 0) {
        const minX = Math.min(...pTargets.map((t) => t.x));
        const maxX = Math.max(...pTargets.map((t) => t.x));
        newLines.push({ id: 'p-branch-bar', path: `M ${minX} ${pMidY} L ${maxX} ${pMidY}` });
        pTargets.forEach((t, i) => {
          newLines.push({ id: `p-target-${i}`, path: `M ${t.x} ${pMidY} L ${t.x} ${t.top}` });
        });
      }
    }

    // 2. Maternal Grandparents -> Mother & Uncles
    const mGpa = getCoords('m_gpa');
    const mGma = getCoords('m_gma');
    const mother = getCoords('mother');
    const mUncles = members
      .filter((m) => m.branch === 'maternal' && m.tier === 'uncles')
      .map((m) => getCoords(m.id))
      .filter(Boolean);

    if (mother && (mGpa || mGma)) {
      const gpX = mGpa && mGma ? (mGpa.x + mGma.x) / 2 : (mGpa || mGma).x;
      const gpY = mGpa && mGma ? Math.max(mGpa.bottom, mGma.bottom) : (mGpa || mGma).bottom;
      
      const mMidY = gpY + 24;
      newLines.push({ id: 'm-gp-stem', path: `M ${gpX} ${gpY} L ${gpX} ${mMidY}` });

      const mTargets = [mother, ...mUncles];
      if (mTargets.length > 0) {
        const minX = Math.min(...mTargets.map((t) => t.x));
        const maxX = Math.max(...mTargets.map((t) => t.x));
        newLines.push({ id: 'm-branch-bar', path: `M ${minX} ${mMidY} L ${maxX} ${mMidY}` });
        mTargets.forEach((t, i) => {
          newLines.push({ id: `m-target-${i}`, path: `M ${t.x} ${mMidY} L ${t.x} ${t.top}` });
        });
      }
    }

    // 3. Father & Mother Union -> Children / Self
    const unionHeart = getCoords('union-heart');
    const sibNodes = members
      .filter((m) => m.branch === 'self')
      .map((m) => getCoords(m.id))
      .filter(Boolean);

    if (father && mother) {
      newLines.push({
        id: 'parents-marriage',
        path: `M ${father.right} ${father.y} L ${mother.left} ${mother.y}`,
        style: 'dashed'
      });
    }

    if (unionHeart && sibNodes.length > 0) {
      const uY = unionHeart.bottom;
      const uX = unionHeart.x;
      const sibMidY = uY + 30;

      newLines.push({ id: 'union-stem', path: `M ${uX} ${uY} L ${uX} ${sibMidY}` });

      const minX = Math.min(...sibNodes.map((s) => s.x));
      const maxX = Math.max(...sibNodes.map((s) => s.x));
      newLines.push({ id: 'sib-branch-bar', path: `M ${minX} ${sibMidY} L ${maxX} ${sibMidY}` });

      sibNodes.forEach((s, i) => {
        newLines.push({ id: `sib-target-${i}`, path: `M ${s.x} ${sibMidY} L ${s.x} ${s.top}` });
      });
    }

    // 4. Self / Spouse -> Next Generation (Children)
    const selfNode = getCoords('self');
    const spouseNode = getCoords('spouse');
    const childNodes = members
      .filter((m) => m.branch === 'children')
      .map((m) => getCoords(m.id))
      .filter(Boolean);

    if (selfNode && childNodes.length > 0) {
      const anchorX = spouseNode ? (selfNode.x + spouseNode.x) / 2 : selfNode.x;
      const anchorY = selfNode.bottom;
      const childMidY = anchorY + 30;

      newLines.push({ id: 'children-stem', path: `M ${anchorX} ${anchorY} L ${anchorX} ${childMidY}` });

      const minX = Math.min(...childNodes.map((c) => c.x));
      const maxX = Math.max(...childNodes.map((c) => c.x));
      newLines.push({ id: 'child-branch-bar', path: `M ${minX} ${childMidY} L ${maxX} ${childMidY}` });

      childNodes.forEach((c, i) => {
        newLines.push({ id: `child-target-${i}`, path: `M ${c.x} ${childMidY} L ${c.x} ${c.top}` });
      });
    }

    setLines(newLines);
  }, [members, activeTab, zoom, printSize]);

  useLayoutEffect(() => {
    recalculateLines();
    const handleResize = () => recalculateLines();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalculateLines]);

  // Recalculate dynamic SVG lines on render cycles
  useEffect(() => {
    const timer = setTimeout(recalculateLines, 100);
    return () => clearTimeout(timer);
  }, [members, zoom, activeTab, recalculateLines]);

  // --- MEMBER CRUD ACTIONS ---
  const closeEditor = () => {
    setEditingMember(null);
    setIsAddingNew(false);
  };

  const handleAddMember = (branch, tier, defaultRole = 'Relative') => {
    const newId = 'm_' + Date.now();
    const newMember = {
      id: newId,
      branch: branch, // 'paternal' | 'maternal' | 'self' | 'children'
      tier: tier,     // 'grandparents' | 'uncles' | 'parents' | 'siblings' | 'spouse' | 'children'
      role: defaultRole,
      name: '',
      maidenName: '',
      birth: '',
      death: '',
      origin: '',
      bio: '',
      photo: ''
    };

    // Not added to the tree until the user presses "Add to Tree" (Cancel leaves nothing behind)
    setEditingMember(newMember);
    setIsAddingNew(true);
  };

  const handleSaveMember = (updatedMember) => {
    if (!updatedMember.name || !updatedMember.name.trim()) {
      showNotification('Please enter a name first.');
      return;
    }
    const cleaned = { ...updatedMember, name: updatedMember.name.trim() };
    const wasNew = isAddingNew;
    setMembers((prev) =>
      wasNew ? [...prev, cleaned] : prev.map((m) => (m.id === cleaned.id ? cleaned : m))
    );
    closeEditor();
    showNotification(wasNew ? `Added ${cleaned.name} to the tree` : `Saved changes for ${cleaned.name}`);
  };

  // Keep a person visible in the diagram when their branch changes
  const handleBranchChange = (branch) => {
    setEditingMember((m) => {
      let tier = m.tier;
      if (branch === 'paternal' || branch === 'maternal') {
        if (!['grandparents', 'uncles', 'parents'].includes(tier)) tier = 'uncles';
      } else if (branch === 'self') {
        if (!['siblings', 'spouse'].includes(tier)) tier = 'siblings';
      } else if (branch === 'children') {
        tier = 'children';
      }
      return { ...m, branch, tier };
    });
  };

  // Shrink uploaded photos so they fit comfortably in browser storage
  const readPhoto = (file, done) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 400 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        done(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => showNotification("Couldn't read that image. Try a JPG or PNG.");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMember = (id) => {
    const memberObj = members.find((m) => m.id === id);
    if (!memberObj) { closeEditor(); return; }
    if (!window.confirm(`Remove ${memberObj.name} from the tree? This can't be undone.`)) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    closeEditor();
    showNotification(`Removed ${memberObj.name} from the tree.`);
  };

  // Esc closes the editor
  useEffect(() => {
    if (!editingMember) return;
    const onKey = (e) => { if (e.key === 'Escape') closeEditor(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingMember]);

  // --- FILE BACKUP / RESTORE / RESET ---
  const handleExportJSON = () => {
    const data = { members, histories, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Family_Tree_Archive_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported complete family backup!');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || !Array.isArray(parsed.members)) throw new Error('bad shape');
        if (!window.confirm(`Load ${parsed.members.length} people from this file? It will replace what is currently in the tree.`)) return;
        setMembers(parsed.members);
        if (parsed.histories) setHistories(parsed.histories);
        showNotification('Successfully imported family tree file!');
      } catch (err) {
        showNotification('Invalid JSON family data file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset family tree to initial template data? Any custom edits will be overwritten.')) {
      setMembers(DEFAULT_MEMBERS);
      setHistories(DEFAULT_HISTORIES);
      setZoom(1);
      showNotification('Template restored to default!');
    }
  };

  const handlePrint = () => {
    // Print mode: fixed-width, chrome hidden, page sized exactly to the tree so connector lines stay aligned.
    const prevZoom = zoom;
    const prevTab = activeTab;
    setActiveTab('diagram');
    setZoom(1);
    setPrintSize(1); // enter print mode (hides toolbar/header, fixes width)
    const restore = () => {
      setPrintSize(0);
      setZoom(prevZoom);
      setActiveTab(prevTab);
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setTimeout(() => {
      const h = Math.ceil(document.querySelector('main')?.getBoundingClientRect().height || 1400) + 2;
      setPrintSize(h);
      setTimeout(() => window.print(), 400);
    }, 400);
  };

  // Filtered Groups for Diagram Display
  const paternalGrandparents = members.filter((m) => m.branch === 'paternal' && m.tier === 'grandparents');
  const paternalUncles = members.filter((m) => m.branch === 'paternal' && m.tier === 'uncles');
  const fatherObj = members.find((m) => m.id === 'father') || members.find((m) => m.branch === 'paternal' && m.tier === 'parents');

  const maternalGrandparents = members.filter((m) => m.branch === 'maternal' && m.tier === 'grandparents');
  const maternalUncles = members.filter((m) => m.branch === 'maternal' && m.tier === 'uncles');
  const motherObj = members.find((m) => m.id === 'mother') || members.find((m) => m.branch === 'maternal' && m.tier === 'parents');

  const selfAndSiblings = members.filter((m) => m.branch === 'self' && m.tier !== 'spouse');
  const spouseObj = members.find((m) => m.branch === 'self' && m.tier === 'spouse');
  const childrenList = members.filter((m) => m.branch === 'children');

  return (
    <div
      className="min-h-screen bg-[#F7F4EC] text-[#2C2A29] font-sans flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#1F3A3D]"
      style={printSize ? { width: PRINT_WIDTH, minHeight: 0 } : undefined}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          html, body { background: #F7F4EC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          main { overflow: visible !important; }
          * { box-shadow: none !important; transition: none !important; }
        }
        ${printSize ? `
          .no-print { display: none !important; }
          main { overflow: visible !important; }
          * { transition: none !important; }
          @page { size: ${PRINT_WIDTH}px ${printSize}px; margin: 0; }
        ` : ''}
      `}</style>
      {/* --- BOTANICAL HEIRLOOM HEADER --- */}
      <header className="no-print bg-[#1F3A3D] text-[#F7F4EC] border-b-4 border-[#C5A059] shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Main Title & Botanical Icon */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#C5A059] shadow-inner">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wide text-[#F7F4EC] flex items-center gap-2">
                Our Family Tree & Heritage Chronicle
              </h1>
              <p className="text-xs text-[#C5A059] tracking-wider uppercase font-medium">
                Click any card to edit • Use the + buttons to add relatives
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center bg-[#152729] p-1 rounded-lg border border-[#C5A059]/40 text-xs font-medium">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'diagram'
                  ? 'bg-[#C5A059] text-[#1F3A3D] font-bold shadow'
                  : 'text-[#E0D8C3] hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12H4z" />
              </svg>
              Tree Diagram
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#C5A059] text-[#1F3A3D] font-bold shadow'
                  : 'text-[#E0D8C3] hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Family Stories
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-[#C5A059] text-[#1F3A3D] font-bold shadow'
                  : 'text-[#E0D8C3] hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Members
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleExportJSON}
              title="Export Family Backup (.json)"
              className="px-2.5 py-1.5 bg-[#152729] hover:bg-[#25464A] text-[#E0D8C3] border border-[#C5A059]/40 rounded-md transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export Backup</span>
            </button>

            <label className="px-2.5 py-1.5 bg-[#152729] hover:bg-[#25464A] text-[#E0D8C3] border border-[#C5A059]/40 rounded-md cursor-pointer transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={handlePrint}
              title="Print Family Chart"
              className="px-2.5 py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#1F3A3D] font-bold rounded-md transition flex items-center gap-1 shadow"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleResetDefault}
              title="Reset to Template"
              aria-label="Reset to sample data"
              className="px-2.5 py-1.5 bg-[#152729] hover:bg-red-900/40 text-red-300 border border-red-500/30 rounded-md transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

        </div>
      </header>

      {/* --- NOTIFICATION TOAST --- */}
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 bg-[#1F3A3D] text-[#F7F4EC] border-2 border-[#C5A059] px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-full overflow-x-auto p-4 md:p-6">
        
        {/* ========================================================= */}
        {/* TAB 1: AUTO-EXPANDING TREE DIAGRAM CANVAS                 */}
        {/* ========================================================= */}
        {activeTab === 'diagram' && (
          <div className="space-y-6">
            
            {/* First-run help */}
            {showHint && (
              <div className="no-print bg-[#1F3A3D] text-[#F7F4EC] border-2 border-[#C5A059] rounded-xl p-4 flex flex-wrap items-start justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-base">Welcome — here's how it works</p>
                  <ul className="text-xs md:text-sm text-[#E0D8C3] space-y-0.5 list-disc pl-5">
                    <li><b>Edit anyone:</b> click their card to change the name, dates, photo or story.</li>
                    <li><b>Add someone:</b> use the colored "+" buttons below, or the dashed boxes in the tree.</li>
                    <li><b>Saving:</b> changes are kept automatically <u>in this browser only</u>. Use <b>Export Backup</b> to save a file you can send to relatives, and <b>Import</b> to open one.</li>
                  </ul>
                </div>
                <button onClick={dismissHint} className="px-3 py-1.5 bg-[#C5A059] text-[#1F3A3D] rounded-md text-xs font-bold hover:bg-[#D4AF37] transition">
                  Got it
                </button>
              </div>
            )}

            {/* Top Controls Bar (Zoom + Branch Quick Add) */}
            <div className="no-print bg-[#FFFBF5] border border-[#D9CDB8] p-3 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Branch Add Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif font-bold text-[#1F3A3D] uppercase tracking-wider text-[11px] mr-1">
                  Add a family member:
                </span>

                <button
                  onClick={() => handleAddMember('paternal', 'grandparents', 'Paternal Grandparent')}
                  className="px-2.5 py-1 bg-[#1F3A3D] text-[#F7F4EC] hover:bg-[#2D5A5D] rounded-md border border-[#C5A059]/40 transition font-medium flex items-center gap-1"
                >
                  <span className="text-[#C5A059] font-bold">+</span> Grandparent (Dad's side)
                </button>

                <button
                  onClick={() => handleAddMember('paternal', 'uncles', 'Paternal Aunt/Uncle')}
                  className="px-2.5 py-1 bg-[#1F3A3D] text-[#F7F4EC] hover:bg-[#2D5A5D] rounded-md border border-[#C5A059]/40 transition font-medium flex items-center gap-1"
                >
                  <span className="text-[#C5A059] font-bold">+</span> Aunt / Uncle (Dad's side)
                </button>

                <button
                  onClick={() => handleAddMember('maternal', 'grandparents', 'Maternal Grandparent')}
                  className="px-2.5 py-1 bg-[#8C5A3C] text-[#F7F4EC] hover:bg-[#A66E4E] rounded-md border border-[#D4AF37]/40 transition font-medium flex items-center gap-1"
                >
                  <span className="text-[#D4AF37] font-bold">+</span> Grandparent (Mom's side)
                </button>

                <button
                  onClick={() => handleAddMember('maternal', 'uncles', 'Maternal Aunt/Uncle')}
                  className="px-2.5 py-1 bg-[#8C5A3C] text-[#F7F4EC] hover:bg-[#A66E4E] rounded-md border border-[#D4AF37]/40 transition font-medium flex items-center gap-1"
                >
                  <span className="text-[#D4AF37] font-bold">+</span> Aunt / Uncle (Mom's side)
                </button>

                <button
                  onClick={() => handleAddMember('self', 'siblings', 'Sibling')}
                  className="px-2.5 py-1 bg-[#6A5ACD] text-white hover:bg-[#5A4ACD] rounded-md transition font-medium flex items-center gap-1"
                >
                  <span>+</span> Sibling
                </button>

                <button
                  onClick={() => handleAddMember('children', 'children', 'Child')}
                  className="px-2.5 py-1 bg-[#2E8B57] text-white hover:bg-[#246B43] rounded-md transition font-medium flex items-center gap-1"
                >
                  <span>+</span> Child
                </button>
              </div>

              {/* Canvas Zoom Tools */}
              <div className="flex items-center space-x-2 bg-[#F7F4EC] p-1 rounded-lg border border-[#D9CDB8]">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                  className="p-1 hover:bg-[#EAE4D3] rounded text-[#1F3A3D] font-bold"
                  title="Zoom Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                <span className="font-mono text-[11px] font-bold text-[#1F3A3D] w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                  className="p-1 hover:bg-[#EAE4D3] rounded text-[#1F3A3D] font-bold"
                  title="Zoom In"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="px-2 py-0.5 hover:bg-[#EAE4D3] rounded text-[10px] font-bold text-[#8C5A3C] uppercase"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>

            </div>

            {/* --- VISUAL CANVAS CONTAINER --- */}
            <div
              ref={containerRef}
              className="relative min-h-[850px] overflow-auto bg-[#FBF9F3] border-2 border-[#D9CDB8] rounded-2xl p-6 shadow-inner"
              style={{
                backgroundImage: `radial-gradient(#C5A059 0.5px, transparent 0.5px), radial-gradient(#C5A059 0.5px, #FBF9F3 0.5px)`,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
                opacity: 0.98
              }}
            >
              {/* Scalable Canvas Content */}
              <div
                ref={canvasRef}
                className="relative transition-transform duration-200 origin-top center min-w-[1100px] pb-16"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* SVG Overlay for Dynamic Line Connectors */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="lineGradPaternal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1F3A3D" />
                      <stop offset="100%" stopColor="#C5A059" />
                    </linearGradient>
                    <linearGradient id="lineGradMaternal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8C5A3C" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>

                  {lines.map((l) => (
                    <path
                      key={l.id}
                      d={l.path}
                      fill="none"
                      stroke={l.id.startsWith('m-') ? '#8C5A3C' : l.id.startsWith('p-') ? '#1F3A3D' : '#C5A059'}
                      strokeWidth="2.5"
                      strokeDasharray={l.style === 'dashed' ? '5,5' : 'none'}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  ))}
                </svg>

                {/* ======================================================== */}
                {/* BRANCH HEADER LABELS                                     */}
                {/* ======================================================== */}
                <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                  
                  {/* PATERNAL HEADER */}
                  <div className="bg-[#1F3A3D] text-[#F7F4EC] p-3 rounded-xl border-2 border-[#C5A059] shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">
                        Paternal Lineage
                      </span>
                      <h2 className="font-serif text-lg font-bold">Father's Family</h2>
                    </div>
                    <button
                      onClick={() => handleAddMember('paternal', 'grandparents', 'Paternal Grandparent')}
                      className="no-print text-xs bg-[#C5A059] text-[#1F3A3D] px-2.5 py-1 rounded font-bold hover:bg-[#D4AF37] transition"
                    >
                      + Add Grandparent
                    </button>
                  </div>

                  {/* MATERNAL HEADER */}
                  <div className="bg-[#8C5A3C] text-[#F7F4EC] p-3 rounded-xl border-2 border-[#D4AF37] shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">
                        Maternal Lineage
                      </span>
                      <h2 className="font-serif text-lg font-bold">Mother's Family</h2>
                    </div>
                    <button
                      onClick={() => handleAddMember('maternal', 'grandparents', 'Maternal Grandparent')}
                      className="no-print text-xs bg-[#D4AF37] text-[#8C5A3C] px-2.5 py-1 rounded font-bold hover:bg-[#F3E5AB] transition"
                    >
                      + Add Grandparent
                    </button>
                  </div>

                </div>

                {/* ======================================================== */}
                {/* TIER 1: GRANDPARENTS GENERATION                          */}
                {/* ======================================================== */}
                <div className="grid grid-cols-2 gap-8 mb-16 relative z-10">
                  
                  {/* Paternal Grandparents Row */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {paternalGrandparents.map((member) => (
                      <MemberCard key={member.id} member={member} onEdit={setEditingMember} />
                    ))}
                    {paternalGrandparents.length === 0 && (
                      <EmptyPlaceholder
                        label="No Paternal Grandparents Added"
                        onClick={() => handleAddMember('paternal', 'grandparents', 'Paternal Grandfather')}
                      />
                    )}
                  </div>

                  {/* Maternal Grandparents Row */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {maternalGrandparents.map((member) => (
                      <MemberCard key={member.id} member={member} onEdit={setEditingMember} />
                    ))}
                    {maternalGrandparents.length === 0 && (
                      <EmptyPlaceholder
                        label="No Maternal Grandparents Added"
                        onClick={() => handleAddMember('maternal', 'grandparents', 'Maternal Grandfather')}
                      />
                    )}
                  </div>

                </div>

                {/* ======================================================== */}
                {/* TIER 2: PARENTS & AUNTS / UNCLES GENERATION              */}
                {/* ======================================================== */}
                <div className="grid grid-cols-2 gap-8 mb-20 relative z-10">
                  
                  {/* Father Side: Aunts/Uncles & Father */}
                  <div className="flex flex-wrap justify-center items-center gap-4">
                    {paternalUncles.map((member) => (
                      <MemberCard key={member.id} member={member} onEdit={setEditingMember} />
                    ))}
                    {fatherObj ? (
                      <MemberCard member={fatherObj} onEdit={setEditingMember} isHighlighted />
                    ) : (
                      <EmptyPlaceholder
                        label="Add Father Profile"
                        onClick={() => handleAddMember('paternal', 'parents', 'Father')}
                      />
                    )}
                  </div>

                  {/* Mother Side: Mother & Aunts/Uncles */}
                  <div className="flex flex-wrap justify-center items-center gap-4">
                    {motherObj ? (
                      <MemberCard member={motherObj} onEdit={setEditingMember} isHighlighted />
                    ) : (
                      <EmptyPlaceholder
                        label="Add Mother Profile"
                        onClick={() => handleAddMember('maternal', 'parents', 'Mother')}
                      />
                    )}
                    {maternalUncles.map((member) => (
                      <MemberCard key={member.id} member={member} onEdit={setEditingMember} />
                    ))}
                  </div>

                </div>

                {/* ======================================================== */}
                {/* PARENTS' UNION BADGE (CENTER PIECE)                       */}
                {/* ======================================================== */}
                <div className="flex justify-center -mt-12 mb-16 relative z-20">
                  <div
                    id="card-union-heart"
                    className="bg-[#FFFBF5] border-2 border-[#C5A059] px-6 py-2.5 rounded-full shadow-lg flex items-center space-x-3"
                  >
                    <svg className="w-6 h-6 text-[#8C5A3C] fill-current animate-pulse" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <div className="text-center">
                      <span className="font-serif font-bold text-sm text-[#1F3A3D] block">
                        Parents' Union & Marriage
                      </span>
                      <span className="text-[10px] text-[#8C5A3C] font-semibold uppercase tracking-widest">
                        Lineage Confluence
                      </span>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* TIER 3: IMMEDIATE FAMILY (YOU, SIBLINGS & SPOUSE)        */}
                {/* ======================================================== */}
                <div className="mb-16 relative z-10">
                  <div className="text-center mb-3">
                    <span className="text-xs font-serif font-bold text-[#1F3A3D] bg-[#EAE4D3] px-3 py-1 rounded-full border border-[#C5A059]/40">
                      Immediate Family & Siblings Branch
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 items-center">
                    {selfAndSiblings.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onEdit={setEditingMember}
                        isHighlighted={member.id === 'self'}
                      />
                    ))}

                    {/* Spouse / Partner Card */}
                    {spouseObj && (
                      <MemberCard key={spouseObj.id} member={spouseObj} onEdit={setEditingMember} />
                    )}

                    {!spouseObj && (
                      <button
                        onClick={() => handleAddMember('self', 'spouse', 'Spouse / Partner')}
                        className="no-print border-2 border-dashed border-[#C5A059] p-4 rounded-xl text-xs font-bold text-[#8C5A3C] hover:bg-[#FFFBF5] transition flex items-center gap-1.5"
                      >
                        <span>+ Add Spouse / Partner</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* TIER 4: NEXT GENERATION (CHILDREN)                       */}
                {/* ======================================================== */}
                <div className="relative z-10">
                  <div className="text-center mb-3">
                    <span className="text-xs font-serif font-bold text-[#2E8B57] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#2E8B57]/40">
                      Next Generation & Children
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 items-center">
                    {childrenList.map((member) => (
                      <MemberCard key={member.id} member={member} onEdit={setEditingMember} />
                    ))}

                    <button
                      onClick={() => handleAddMember('children', 'children', 'Child')}
                      className="no-print border-2 border-dashed border-[#2E8B57] p-4 rounded-xl text-xs font-bold text-[#2E8B57] hover:bg-[#F0F9F4] transition flex items-center gap-1.5"
                    >
                      <span>+ Add Child / Next Generation</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Embedded History Panel Quick Access */}
            <div className="bg-[#FFFBF5] border border-[#D9CDB8] p-5 rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1F3A3D]">
                  Family History Chronicles & Lineage Narratives
                </h3>
                <p className="text-xs text-[#666] mt-0.5">
                  Preserve ancestral stories, migration routes, and how both families came together.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 bg-[#1F3A3D] text-[#F7F4EC] rounded-lg text-xs font-bold hover:bg-[#2D5A5D] transition shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Open & Edit Brief Histories
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: EXPANDABLE BRIEF HISTORIES (NARRATIVE PANELS)      */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto space-y-8 py-2">
            
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1F3A3D]">
                Family History & Heritage Narrative Chronicles
              </h2>
              <p className="text-xs md:text-sm text-[#666] max-w-2xl mx-auto">
                Record the history, clan origins, trades, and defining milestones for both sides of your family. These text fields automatically expand as you type.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Paternal Family History Box */}
              <div className="bg-[#FFFBF5] border-2 border-[#1F3A3D] rounded-2xl shadow-md overflow-hidden flex flex-col">
                <div className="bg-[#1F3A3D] text-[#F7F4EC] px-5 py-3.5 border-b-2 border-[#C5A059] flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                    Father's Family History (Paternal Line)
                  </h3>
                  <span className="text-[11px] text-[#C5A059] font-mono">Paternal Archive</span>
                </div>
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <label className="text-xs font-bold text-[#1F3A3D] uppercase tracking-wider">
                    Ancestral Origins, Clan Roots & Milestones
                  </label>
                  <textarea
                    value={histories.paternal}
                    onChange={(e) => setHistories({ ...histories, paternal: e.target.value })}
                    rows={12}
                    className="w-full flex-1 bg-[#FBF9F3] border border-[#D9CDB8] rounded-xl p-4 text-xs leading-relaxed font-sans text-[#2C2A29] focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none resize-y"
                    placeholder="Type the history of your father's family here (origins, clan/surname history, migration, occupations)..."
                  />
                </div>
              </div>

              {/* Maternal Family History Box */}
              <div className="bg-[#FFFBF5] border-2 border-[#8C5A3C] rounded-2xl shadow-md overflow-hidden flex flex-col">
                <div className="bg-[#8C5A3C] text-[#F7F4EC] px-5 py-3.5 border-b-2 border-[#D4AF37] flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                    Mother's Family History (Maternal Line)
                  </h3>
                  <span className="text-[11px] text-[#D4AF37] font-mono">Maternal Archive</span>
                </div>
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <label className="text-xs font-bold text-[#8C5A3C] uppercase tracking-wider">
                    Maiden Roots, Family Lore & Heritage
                  </label>
                  <textarea
                    value={histories.maternal}
                    onChange={(e) => setHistories({ ...histories, maternal: e.target.value })}
                    rows={12}
                    className="w-full flex-1 bg-[#FBF9F3] border border-[#D9CDB8] rounded-xl p-4 text-xs leading-relaxed font-sans text-[#2C2A29] focus:ring-2 focus:ring-[#8C5A3C] focus:outline-none resize-y"
                    placeholder="Type the history of your mother's family here (maiden surname history, ancestral village, traditions, recipes)..."
                  />
                </div>
              </div>

            </div>

            {/* Combined Parents' Union History Box */}
            <div className="bg-[#FFFBF5] border-2 border-[#C5A059] rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#1F3A3D] via-[#6A5ACD] to-[#8C5A3C] text-white px-5 py-3.5 flex items-center justify-between">
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#C5A059]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Parents' Union & Household Traditions
                </h3>
                <span className="text-xs font-mono text-[#D4AF37]">Joint Lineage Chronicle</span>
              </div>
              <div className="p-5 space-y-3">
                <label className="text-xs font-bold text-[#1F3A3D] uppercase tracking-wider">
                  How Parents Met, Marriage & Combined Family Values
                </label>
                <textarea
                  value={histories.union}
                  onChange={(e) => setHistories({ ...histories, union: e.target.value })}
                  rows={6}
                  className="w-full bg-[#FBF9F3] border border-[#D9CDB8] rounded-xl p-4 text-xs leading-relaxed font-sans text-[#2C2A29] focus:ring-2 focus:ring-[#C5A059] focus:outline-none resize-y"
                  placeholder="Record how your parents met, wedding details, family values, and joint home traditions..."
                />
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MEMBER INDEX & DIRECTORY TABLE                    */}
        {/* ========================================================= */}
        {activeTab === 'directory' && (
          <div className="max-w-6xl mx-auto space-y-6 py-2">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F3A3D]">
                  Family Member Directory ({members.length} Members Recorded)
                </h2>
                <p className="text-xs text-[#666]">
                  A structured index of all recorded individuals across both paternal and maternal lines.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddMember('paternal', 'uncles', 'Relative')}
                  className="px-3 py-1.5 bg-[#1F3A3D] text-[#F7F4EC] rounded-md text-xs font-bold hover:bg-[#2D5A5D] transition"
                >
                  + Add Paternal Relative
                </button>
                <button
                  onClick={() => handleAddMember('maternal', 'uncles', 'Relative')}
                  className="px-3 py-1.5 bg-[#8C5A3C] text-[#F7F4EC] rounded-md text-xs font-bold hover:bg-[#A66E4E] transition"
                >
                  + Add Maternal Relative
                </button>
              </div>
            </div>

            <div className="bg-[#FFFBF5] border border-[#D9CDB8] rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1F3A3D] text-[#F7F4EC] border-b border-[#C5A059]">
                    <th className="p-3">Portrait</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Branch & Role</th>
                    <th className="p-3">Lifespan / Dates</th>
                    <th className="p-3">Hometown / Origin</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D3]">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F4EC] transition">
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-full border border-[#C5A059] overflow-hidden bg-[#EAE4D3] flex items-center justify-center">
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-serif font-bold text-xs text-[#1F3A3D]">
                              {m.name ? m.name.charAt(0) : '?'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-[#1F3A3D]">
                        <div className="font-bold">{m.name}</div>
                        {m.maidenName && (
                          <div className="text-[10px] text-[#8C5A3C]">née {m.maidenName}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.branch === 'paternal'
                              ? 'bg-[#1F3A3D]/10 text-[#1F3A3D] border border-[#1F3A3D]/30'
                              : m.branch === 'maternal'
                              ? 'bg-[#8C5A3C]/10 text-[#8C5A3C] border border-[#8C5A3C]/30'
                              : 'bg-[#6A5ACD]/10 text-[#6A5ACD] border border-[#6A5ACD]/30'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="p-3 text-[#555]">
                        {m.birth || m.death ? `${m.birth || '?'} – ${m.death || 'Present'}` : '—'}
                      </td>
                      <td className="p-3 text-[#555]">{m.origin || '—'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="px-2 py-1 bg-[#1F3A3D] text-[#F7F4EC] rounded hover:bg-[#2D5A5D] text-[11px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-[11px] font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* SLIDE-OVER / MODAL MEMBER EDITOR                          */}
      {/* ========================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSaveMember(editingMember); }}
            className="w-full max-w-lg bg-[#FFFBF5] h-full shadow-2xl border-l-4 border-[#C5A059] flex flex-col overflow-y-auto"
          >
            
            {/* Modal Header */}
            <div className="bg-[#1F3A3D] text-[#F7F4EC] p-4 border-b border-[#C5A059] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#C5A059] font-mono uppercase tracking-widest block">
                  {isAddingNew ? 'New profile · Esc to cancel' : 'Editing profile · Esc to close'}
                </span>
                <h3 className="font-serif font-bold text-lg">{isAddingNew ? 'Add a Family Member' : editingMember.name || 'Edit Member'}</h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeEditor}
                className="text-[#E0D8C3] hover:text-white p-1 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5 flex-1">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center space-y-3 p-4 bg-[#F7F4EC] rounded-xl border border-[#D9CDB8]">
                <div className="relative w-28 h-28 rounded-full border-4 border-[#C5A059] overflow-hidden bg-[#EAE4D3] shadow-md group">
                  {editingMember.photo ? (
                    <img src={editingMember.photo} alt="Portrait" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8C5A3C] p-2 text-center">
                      <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-[10px] font-medium mt-1">No Photo</span>
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) readPhoto(file, (data) => setEditingMember((m) => ({ ...m, photo: data })));
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <label className="px-3 py-1 bg-[#1F3A3D] text-[#F7F4EC] rounded text-xs font-bold cursor-pointer hover:bg-[#2D5A5D] transition">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) readPhoto(file, (data) => setEditingMember((m) => ({ ...m, photo: data })));
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {editingMember.photo && (
                    <button
                      type="button"
                      onClick={() => setEditingMember({ ...editingMember, photo: '' })}
                      className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                    required
                    autoFocus
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Maiden Name (Optional)</label>
                  <input
                    type="text"
                    value={editingMember.maidenName}
                    onChange={(e) => setEditingMember({ ...editingMember, maidenName: e.target.value })}
                    className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                    placeholder="e.g. Campbell"
                  />
                </div>
              </div>

              {/* Role & Branch Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Role / Relationship Title</label>
                  <input
                    type="text"
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                    placeholder="e.g. Aunt, Brother, Cousin"
                    list="role-options"
                  />
                  <datalist id="role-options">
                    {['Grandfather','Grandmother','Father','Mother','Aunt','Uncle','Cousin','Brother','Sister','Spouse / Partner','Son','Daughter','Grandchild','Friend of the family'].map((r) => <option key={r} value={r} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Which part of the tree?</label>
                  <select
                    value={editingMember.branch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                  >
                    <option value="paternal">Dad's side</option>
                    <option value="maternal">Mom's side</option>
                    <option value="self">My household</option>
                    <option value="children">Children</option>
                  </select>
                </div>
              </div>

              {/* Lifespan Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Birth Year / Date</label>
                  <input
                    type="text"
                    value={editingMember.birth}
                    onChange={(e) => setEditingMember({ ...editingMember, birth: e.target.value })}
                    className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                    placeholder="e.g. 1968"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Passing Year (If applicable)</label>
                  <input
                    type="text"
                    value={editingMember.death}
                    onChange={(e) => setEditingMember({ ...editingMember, death: e.target.value })}
                    className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                    placeholder="e.g. 2015"
                  />
                </div>
              </div>

              {/* Hometown / Origin */}
              <div>
                <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Hometown / Place of Origin</label>
                <input
                  type="text"
                  value={editingMember.origin}
                  onChange={(e) => setEditingMember({ ...editingMember, origin: e.target.value })}
                  className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                  placeholder="e.g. Edinburgh, Scotland"
                />
              </div>

              {/* Biography Notes */}
              <div>
                <label className="block text-xs font-bold text-[#1F3A3D] mb-1">Biography & Memories</label>
                <textarea
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-white border border-[#D9CDB8] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1F3A3D] focus:outline-none"
                  placeholder="Record notable career, achievements, personality traits, and favorite stories..."
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#F7F4EC] border-t border-[#D9CDB8] flex items-center justify-between">
              {isAddingNew ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => handleDeleteMember(editingMember.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition"
                >
                  Delete Member
                </button>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1F3A3D] text-[#F7F4EC] rounded-lg text-xs font-bold hover:bg-[#2D5A5D] transition shadow"
                >
                  {isAddingNew ? 'Add to Tree' : 'Save Changes'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="no-print bg-[#1F3A3D] text-[#E0D8C3] text-center text-xs p-4 border-t-2 border-[#C5A059] mt-auto">
        <p className="font-serif">Our Family Tree & Heritage Chronicle</p>
        <p className="mt-1 text-[#C5A059]">Changes save automatically in this browser only — use Export Backup to keep or share a copy.</p>
      </footer>
    </div>
  );
}

// ============================================================================
// COMPONENT: INDIVIDUAL FAMILY MEMBER CARD
// ============================================================================
function MemberCard({ member, onEdit, isHighlighted = false }) {
  const isPaternal = member.branch === 'paternal';
  const isMaternal = member.branch === 'maternal';

  return (
    <div
      id={`card-${member.id}`}
      onClick={() => onEdit(member)}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${member.name || 'family member'}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(member); } }}
      className={`relative w-48 bg-[#FFFBF5] border-2 rounded-2xl p-3 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C5A059] ${
        isHighlighted
          ? 'border-[#C5A059] ring-2 ring-[#C5A059]/50'
          : isPaternal
          ? 'border-[#1F3A3D]/40 hover:border-[#1F3A3D]'
          : isMaternal
          ? 'border-[#8C5A3C]/40 hover:border-[#8C5A3C]'
          : 'border-[#6A5ACD]/40 hover:border-[#6A5ACD]'
      }`}
    >
      {/* Role Badge Header */}
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isPaternal
              ? 'bg-[#1F3A3D] text-[#F7F4EC]'
              : isMaternal
              ? 'bg-[#8C5A3C] text-[#F7F4EC]'
              : 'bg-[#6A5ACD] text-white'
          }`}
        >
          {member.role || 'Member'}
        </span>

        {/* Pencil Edit Icon on Hover */}
        <span className="opacity-60 group-hover:opacity-100 transition text-[#8C5A3C]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </span>
      </div>

      {/* Circular Portrait Frame */}
      <div className="flex justify-center mb-2">
        <div
          className={`relative w-16 h-16 rounded-full border-2 overflow-hidden bg-[#EAE4D3] shadow-inner flex items-center justify-center ${
            isPaternal ? 'border-[#1F3A3D]' : isMaternal ? 'border-[#8C5A3C]' : 'border-[#C5A059]'
          }`}
        >
          {member.photo ? (
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#8C5A3C]">
              <svg className="w-7 h-7 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Name and Lifespan */}
      <div className="text-center space-y-0.5">
        <h4 className="font-serif font-bold text-xs text-[#1F3A3D] line-clamp-1 group-hover:text-[#8C5A3C] transition">
          {member.name || 'Unnamed'}
        </h4>
        {member.maidenName && (
          <p className="text-[10px] italic text-[#8C5A3C]">née {member.maidenName}</p>
        )}
        <p className="text-[10px] text-[#666] font-mono">
          {member.birth || member.death ? `${member.birth || '?'} – ${member.death || ''}` : ''}
        </p>
        {member.origin && (
          <p className="text-[9px] text-[#888] line-clamp-1 italic">{member.origin}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: EMPTY PLACEHOLDER FRAME
// ============================================================================
function EmptyPlaceholder({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-44 h-32 border-2 border-dashed border-[#C5A059]/60 rounded-2xl bg-[#FFFBF5]/60 hover:bg-[#FFFBF5] hover:border-[#C5A059] transition flex flex-col items-center justify-center p-3 text-center group"
    >
      <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 text-[#8C5A3C] flex items-center justify-center font-bold text-base mb-1 group-hover:scale-110 transition">
        +
      </div>
      <span className="text-[11px] font-bold text-[#8C5A3C]">{label}</span>
    </button>
  );
}