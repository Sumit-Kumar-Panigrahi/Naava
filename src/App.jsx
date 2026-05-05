import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, Music, Sparkles, SkipForward, SkipBack, Volume2, Disc, Heart, ChevronDown, Maximize2, Home, TrendingUp, Radio, LayoutGrid, Menu, X } from 'lucide-react';

const MIXED_QUERIES = [
  "latest hit songs hindi odia english official music video mix",
  "top trending billboard hot 100 official music video",
  "viral songs hindi english mashup official video",
  "new releases pop hiphop odia official music video",
  "global top 50 hits official music video",
  "popular romantic songs hindi english odia official video",
  "party dance hit songs official music video mix",
  "best chill lofi pop music hits mix"
];

const getRandomQuery = () => MIXED_QUERIES[Math.floor(Math.random() * MIXED_QUERIES.length)];

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Discover');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  
  const [likedSongs, setLikedSongs] = useState(() => {
    const json = localStorage.getItem('rhythmflow_liked');
    return json ? JSON.parse(json) : {};
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('rhythmflow_volume');
    return saved ? parseInt(saved) : 100;
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    const json = localStorage.getItem('rhythmflow_recent');
    return json ? JSON.parse(json) : [];
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    const json = localStorage.getItem('rhythmflow_search_history');
    return json ? JSON.parse(json) : [];
  });
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  const iframeRef = useRef(null);

  const searchSongs = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=20&videoCategoryId=10&key=AIzaSyDXQPjrw83WYfHv4cj2LYGybS7hh6yenYI`);
      const data = await response.json();
      if (data.items) {
        const results = data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channel: item.snippet.channelTitle
        }));
        setSongs(results);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem('rhythmflow_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('rhythmflow_volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('rhythmflow_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem('rhythmflow_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    searchSongs(getRandomQuery());
  }, []);

  const handleCategoryChange = (category, searchStr) => {
    setActiveCategory(category);
    setIsSidebarOpen(false);
    if (searchStr) {
       searchSongs(searchStr);
    }
    const mainArea = document.querySelector('main');
    if (mainArea) mainArea.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaySong = (song) => {
    setSelectedSong(song);
    setIsPlaying(true);
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.videoId !== song.videoId);
      return [song, ...filtered].slice(0, 50);
    });
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!iframeRef.current) return;
    const func = isPlaying ? "pauseVideo" : "playVideo";
    iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: [] }), "*");
    setIsPlaying(!isPlaying);
  };

  const currentPlaylist = activeCategory === 'Liked Songs' ? Object.values(likedSongs) : songs;

  const playNext = (e) => {
    if (e) e.stopPropagation();
    if (!currentPlaylist.length || !selectedSong) return;
    const currentIndex = currentPlaylist.findIndex(s => s.videoId === selectedSong.videoId);
    if (currentIndex >= 0 && currentIndex < currentPlaylist.length - 1) {
      setSelectedSong(currentPlaylist[currentIndex + 1]);
      setIsPlaying(true);
    }
  };

  const playPrev = (e) => {
    if (e) e.stopPropagation();
    if (!currentPlaylist.length || !selectedSong) return;
    const currentIndex = currentPlaylist.findIndex(s => s.videoId === selectedSong.videoId);
    if (currentIndex > 0) {
      setSelectedSong(currentPlaylist[currentIndex - 1]);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [newVol] }), "*");
    }
  };

  const toggleLike = (e, song) => {
    if (e) e.stopPropagation();
    setLikedSongs(prev => {
      const newLikes = { ...prev };
      if (newLikes[song.videoId]) {
        delete newLikes[song.videoId];
      } else {
        newLikes[song.videoId] = song;
      }
      return newLikes;
    });
  };

  const NavItem = ({ icon: Icon, label, category, search, active }) => (
    <button 
      onClick={() => handleCategoryChange(category, typeof search === 'function' ? search() : search)}
      className={`sidebar-link w-full text-left ${active ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100 overflow-x-hidden relative">
      
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[180px] rounded-full"></div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-[70] p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 lg:hidden"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[60] w-72 glass-panel transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-12 px-2 ml-12 lg:ml-0">
            <div className="w-10 h-10 bg-gradient-to-tr from-fuchsia-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20 shrink-0">
              <Music className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter truncate">Naa<span className="text-fuchsia-500">va</span></span>
          </div>

          <div className="space-y-1 mb-10">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-4">Menu</p>
            <NavItem icon={Home} label="Discover" category="Discover" search={getRandomQuery} active={activeCategory === 'Discover'} />
            <NavItem icon={TrendingUp} label="Trending" category="Trending" search="top global music video chart" active={activeCategory === 'Trending'} />
            <NavItem icon={Radio} label="New Releases" category="New Releases" search="new song releases official video" active={activeCategory === 'New Releases'} />
            <NavItem icon={LayoutGrid} label="Charts" category="Charts" search="billboard hot 100 official music video" active={activeCategory === 'Charts'} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-4">Your Library</p>
            <NavItem icon={Heart} label="Liked Songs" category="Liked Songs" search={null} active={activeCategory === 'Liked Songs'} />
          </div>

          <div className="mt-auto space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-fuchsia-600/10 to-violet-600/10 border border-fuchsia-500/10 backdrop-blur-md">
              <Sparkles size={18} className="text-fuchsia-400 mb-2" />
              <p className="text-sm font-bold mb-1">Go Premium</p>
              <p className="text-[11px] text-zinc-400 mb-3">No ads, unlimited skips, and high fidelity sound.</p>
              <button onClick={() => { setActiveModal('upgrade'); setIsSidebarOpen(false); }} className="w-full py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors">Upgrade</button>
            </div>
            
            <div className="lg:hidden flex flex-col gap-2 pt-2 border-t border-white/10">
              {user ? (
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 mt-2">
                  <div className="flex items-center gap-3 min-w-0">
                     <div className="w-8 h-8 shrink-0 bg-gradient-to-tr from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-white font-bold text-sm truncate">{user.name}</span>
                  </div>
                  <button onClick={() => setUser(null)} className="shrink-0 ml-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold rounded-lg transition-colors">Logout</button>
                </div>
              ) : (
                <>
                  <button onClick={() => { setActiveModal('login'); setIsSidebarOpen(false); }} className="w-full py-2.5 text-zinc-400 text-sm font-bold hover:text-white transition-colors">Log In</button>
                  <button onClick={() => { setActiveModal('signup'); setIsSidebarOpen(false); }} className="w-full py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors">Sign Up</button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 relative z-10 flex flex-col h-screen overflow-y-auto scroll-smooth">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 px-6 lg:px-12 py-6 flex items-center justify-between pointer-events-none">
          <div className="w-full max-w-xl pointer-events-auto flex items-center gap-4">
             <div className="lg:hidden w-12 shrink-0"></div> {/* Spacer for mobile menu icon */}
             <div className="relative group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 transition-colors group-focus-within:text-fuchsia-400" />
              <input 
                type="text" 
                placeholder="Search tracks, artists, albums..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && query.trim()) {
                    handleCategoryChange('Search Results', query);
                    setSearchHistory(prev => {
                      const filtered = prev.filter(q => q !== query.trim());
                      return [query.trim(), ...filtered].slice(0, 10);
                    });
                    setShowSearchHistory(false);
                  }
                }}
                className="w-full bg-[#111111] border border-white/5 focus:border-fuchsia-500/50 text-white rounded-full py-3.5 pl-14 pr-6 text-sm focus:outline-none transition-all shadow-2xl focus:bg-black/60 backdrop-blur-xl"
              />
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {searchHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-zinc-300" onClick={() => {
                        setQuery(item);
                        handleCategoryChange('Search Results', item);
                        setSearchHistory(prev => {
                          const filtered = prev.filter(q => q !== item);
                          return [item, ...filtered].slice(0, 10);
                        });
                        setShowSearchHistory(false);
                    }}>
                      <div className="flex items-center gap-3">
                        <Search size={14} className="text-zinc-500" />
                        <span>{item}</span>
                      </div>
                      <button onClick={(e) => {
                          e.stopPropagation();
                          setSearchHistory(prev => prev.filter(q => q !== item));
                      }} className="p-1.5 text-zinc-500 hover:text-white rounded-full hover:bg-white/10">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 pointer-events-auto shrink-0">
            {user ? (
              <div className="flex items-center gap-4 bg-white/5 py-1.5 px-2 pr-6 rounded-full border border-white/5 shadow-xl backdrop-blur-md">
                <div className="w-8 h-8 bg-gradient-to-tr from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-bold text-sm max-w-[120px] truncate">{user.name}</span>
                <button onClick={() => setUser(null)} className="text-zinc-500 font-bold hover:text-fuchsia-400 transition-colors text-[10px] uppercase tracking-wider ml-2 shrink-0">Logout</button>
              </div>
            ) : (
              <>
                <button onClick={() => setActiveModal('login')} className="text-zinc-400 font-bold hover:text-white transition-colors text-sm whitespace-nowrap shrink-0">Log In</button>
                <button onClick={() => setActiveModal('signup')} className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-fuchsia-500/20 whitespace-nowrap shrink-0">Sign Up</button>
              </>
            )}
          </div>
        </header>

        <div className="px-6 lg:px-12 pt-8 pb-32">
          {/* Header Title */}
          <div className="mb-10 animate-fade-in pr-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
              {activeCategory === 'Liked Songs' ? 'Liked Library' : 'Explore Music'}
            </h1>
            <p className="text-zinc-500 font-medium">
              {activeCategory === 'Liked Songs' ? `You have ${Object.keys(likedSongs).length} tracks in your library.` : 'Find your rhythm with curated global hits and deep cuts.'}
            </p>
            {activeCategory === 'Discover' && searchHistory.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-6 animate-fade-in">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Recent Searches:</span>
                {searchHistory.map((item, index) => (
                   <button 
                     key={index}
                     onClick={() => {
                        setQuery(item);
                        handleCategoryChange('Search Results', item);
                        setSearchHistory(prev => {
                          const filtered = prev.filter(q => q !== item);
                          return [item, ...filtered].slice(0, 10);
                        });
                     }}
                     className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-zinc-300 transition-colors flex items-center gap-2"
                   >
                     {item}
                   </button>
                ))}
              </div>
            )}
          </div>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {currentPlaylist.length > 0 ? (
              currentPlaylist.map((song, index) => (
                <div 
                  key={song.videoId || index} 
                  className={`group glass-card p-3 rounded-3xl cursor-pointer animate-scale-up ${selectedSong?.videoId === song.videoId ? 'border-fuchsia-500/50 bg-white/10' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-2xl">
                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-14 h-14 bg-fuchsia-600 rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl shadow-fuchsia-600/40">
                        <Play className="text-white fill-current w-6 h-6 ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-1 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[15px] text-white truncate group-hover:text-fuchsia-400 transition-colors" dangerouslySetInnerHTML={{ __html: song.title }}></h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">{song.channel}</p>
                    </div>
                    <button onClick={(e) => toggleLike(e, song)} className="shrink-0 p-1 mt-1">
                       <Heart className={`w-5 h-5 transition-all ${likedSongs[song.videoId] ? 'fill-fuchsia-500 text-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'text-zinc-600 hover:text-white'}`} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-zinc-600 animate-fade-in text-center">
                 <Radio size={64} className="mb-4 opacity-20" />
                 <p className="text-xl font-bold tracking-tight">Your library is waiting.</p>
                 <p className="text-sm font-medium opacity-60">Like songs to see them here.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fullscreen Overlay */}
      <div className={`fixed inset-0 z-[100] glass-panel flex flex-col transition-all duration-1000 ease-in-out ${isFullscreen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="p-4 md:p-8 flex items-center justify-between z-10 shrink-0">
          <button onClick={() => setIsFullscreen(false)} className="shrink-0 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors active:scale-95">
            <ChevronDown size={24} />
          </button>
          <div className="text-center flex-1 min-w-0 px-4">
             <p className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-[6px] mb-1 md:mb-2 font-black truncate">Now Playing</p>
             <h2 className="text-lg md:text-2xl font-black truncate text-glow" dangerouslySetInnerHTML={{ __html: selectedSong?.title }}></h2>
          </div>
          <div className="w-[48px] md:w-[56px] shrink-0"></div>
        </div>
        
        <div className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-8 relative cursor-pointer" onClick={() => setIsFullscreen(false)} title="Click background to close">
          <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-video bg-fuchsia-600/10 blur-[120px] rounded-full animate-pulse"></div>
          </div>
          {selectedSong && (
            <iframe
              ref={iframeRef}
              className="w-full max-w-5xl max-h-full aspect-video rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 relative z-10"
              src={`https://www.youtube.com/embed/${selectedSong.videoId}?enablejsapi=1&autoplay=1&origin=${window.location.origin}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          )}
        </div>

        {/* Bottom Unified Controls Area */}
        <div className="px-6 pb-10 pt-4 md:px-12 flex flex-col items-center shrink-0 w-full glass-panel border-t border-white/5 relative z-20">
           
           {/* Row 1: Title & Heart */}
           <div className="flex items-center justify-between w-full max-w-5xl mb-8">
              <div className="flex-1 min-w-0 pr-12">
                <h2 className="text-2xl md:text-4xl font-black mb-1 text-glow truncate" dangerouslySetInnerHTML={{ __html: selectedSong?.title }}></h2>
                <p className="text-xs md:text-sm text-fuchsia-500 font-black uppercase tracking-[4px]">{selectedSong?.channel}</p>
              </div>
              <button onClick={(e) => toggleLike(e, selectedSong)} className="shrink-0 group">
                <Heart size={32} className={`transition-all duration-300 ${likedSongs[selectedSong?.videoId] ? 'fill-fuchsia-500 text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.6)]' : 'text-zinc-500 hover:text-white'}`} />
              </button>
           </div>

           {/* Row 2: Playback Controls */}
           <div className="flex items-center gap-10 md:gap-16 mb-8">
              <SkipBack size={32} onClick={playPrev} className="cursor-pointer text-zinc-400 hover:text-white transition-all active:scale-90" />
              <button 
                onClick={togglePlay}
                className="w-16 h-16 md:w-20 md:h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl active:scale-95"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              <SkipForward size={32} onClick={playNext} className="cursor-pointer text-zinc-400 hover:text-white transition-all active:scale-90" />
           </div>
           
           {/* Row 3: Volume */}
           <div className="w-full max-w-xl flex items-center gap-6">
              <Volume2 size={20} className="text-zinc-500" />
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative group cursor-pointer border border-white/5">
                 <input 
                   type="range" min="0" max="100" value={volume} 
                   onChange={handleVolumeChange}
                   className="absolute inset-0 w-full opacity-0 z-20 cursor-pointer"
                 />
                 <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 shadow-[0_0_10px_rgba(217,70,239,0.3)]" style={{ width: `${volume}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 w-8">{volume}%</span>
           </div>
        </div>
      </div>

      {/* Mini Player */}
      {!isFullscreen && selectedSong && (
        <div className="fixed bottom-8 left-0 lg:left-72 right-0 px-4 lg:px-8 z-50 pointer-events-none">
          <div className="w-full max-w-5xl mx-auto glass-panel rounded-[32px] p-2 flex items-center justify-between shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/10 animate-fade-in pointer-events-auto">
            
            <div className="flex items-center gap-4 flex-1 min-w-0 p-1 cursor-pointer group" onClick={() => setIsFullscreen(true)}>
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative">
                <img src={selectedSong.thumbnail} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 size={16} />
                </div>
              </div>
              <div className="min-w-0 pr-4">
                <h4 className="text-sm font-bold text-white truncate mb-1" dangerouslySetInnerHTML={{ __html: selectedSong.title }}></h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-[2px] leading-none font-black">{selectedSong.channel}</span>
                  <Disc size={12} className={`text-zinc-500 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6 px-4">
              <div className="flex items-center gap-2 sm:gap-6">
                <button onClick={(e) => toggleLike(e, selectedSong)} className="p-2.5 hover:scale-110 active:scale-90 transition-transform">
                  <Heart className={`w-6 h-6 ${likedSongs[selectedSong.videoId] ? 'fill-fuchsia-500 text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.5)]' : 'text-zinc-500 hover:text-white'}`} />
                </button>
                <div className="flex items-center gap-4 sm:gap-8 bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
                  <SkipBack onClick={playPrev} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" size={20} />
                  <button onClick={togglePlay} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg active:scale-95">
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <SkipForward onClick={playNext} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" size={20} />
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-4 w-32 group/vol relative ml-4" onClick={(e) => e.stopPropagation()}>
                 <Volume2 size={16} className="text-zinc-400 group-hover/vol:text-white transition-colors shrink-0" />
                 <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                    <input 
                      type="range" min="0" max="100" value={volume} 
                      onChange={handleVolumeChange}
                      className="absolute inset-0 w-full opacity-0 z-20 cursor-pointer"
                    />
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 shadow-[0_0_10px_rgba(217,70,239,0.5)]" style={{ width: `${volume}%` }}></div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
          
          <div className="relative w-full max-w-md glass-card p-8 rounded-[32px] animate-scale-up shadow-2xl border border-white/10 bg-[#111]/80">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
               <X size={20} />
            </button>
            
            {activeModal === 'login' && (
              <div>
                <h3 className="text-2xl font-black mb-2">Welcome Back</h3>
                <p className="text-zinc-400 text-sm mb-6">Log in to Naava to sync your library.</p>
                <div className="space-y-4">
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <div className="relative">
                    <input type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                    <div className="text-right mt-2">
                      <span onClick={() => setActiveModal('forgot')} className="text-[11px] text-fuchsia-400 cursor-pointer hover:underline font-bold">Forgot Password?</span>
                    </div>
                  </div>
                  <button onClick={() => { if(loginEmail) { setUser({ name: loginEmail.split('@')[0] }); setActiveModal(null); setLoginEmail(''); } }} className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-fuchsia-500/20">Log In</button>
                </div>
                <p className="text-center text-xs text-zinc-500 mt-6">
                  Don't have an account? <span onClick={() => setActiveModal('signup')} className="text-fuchsia-400 cursor-pointer hover:underline font-bold">Sign up</span>
                </p>
              </div>
            )}

            {activeModal === 'forgot' && (
              <div>
                <h3 className="text-2xl font-black mb-2">Reset Password</h3>
                <p className="text-zinc-400 text-sm mb-6">Manually reset your password.</p>
                <div className="space-y-4">
                  <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <input type="password" placeholder="New Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <input type="password" placeholder="Confirm New Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <button onClick={() => { alert('Password manually reset successfully!'); setActiveModal('login'); }} className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-fuchsia-500/20">Update Password</button>
                </div>
                <p className="text-center text-xs text-zinc-500 mt-6">
                  Remembered your password? <span onClick={() => setActiveModal('login')} className="text-fuchsia-400 cursor-pointer hover:underline font-bold">Log in</span>
                </p>
              </div>
            )}

            {activeModal === 'signup' && (
              <div>
                <h3 className="text-2xl font-black mb-2">Join Naava</h3>
                <p className="text-zinc-400 text-sm mb-6">Create an account to save your favorite tracks.</p>
                <div className="space-y-4">
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <input type="password" placeholder="Create Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-white" />
                  <button onClick={() => { if(signupName) { setUser({ name: signupName }); setActiveModal(null); setSignupName(''); } }} className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-fuchsia-500/20">Sign Up</button>
                </div>
                <p className="text-center text-xs text-zinc-500 mt-6">
                  Already have an account? <span onClick={() => setActiveModal('login')} className="text-fuchsia-400 cursor-pointer hover:underline font-bold">Log in</span>
                </p>
              </div>
            )}

            {activeModal === 'upgrade' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-fuchsia-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/40 mb-6">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2">Naava Premium</h3>
                <p className="text-zinc-400 text-sm mb-6">Get unlimited skips, ad-free listening, and offline downloads.</p>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center shrink-0"><span className="text-fuchsia-400 text-xs">✓</span></div>
                     <span className="text-sm font-medium">Ad-free music listening</span>
                   </div>
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center shrink-0"><span className="text-fuchsia-400 text-xs">✓</span></div>
                     <span className="text-sm font-medium">Play any song, even on mobile</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center shrink-0"><span className="text-fuchsia-400 text-xs">✓</span></div>
                     <span className="text-sm font-medium">Unlimited skips</span>
                   </div>
                </div>

                <button onClick={() => { if (!user) { setActiveModal('login'); } else { setActiveModal(null); alert('Redirecting to payment gateway...'); } }} className="w-full py-3 bg-white text-black font-black rounded-xl hover:scale-[1.02] transition-transform shadow-xl">Get Premium for $9.99/mo</button>
                <p className="text-center text-[10px] text-zinc-500 mt-4 uppercase tracking-wider font-bold">Cancel anytime.</p>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
