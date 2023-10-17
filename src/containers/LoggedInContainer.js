import { Icon } from "@iconify/react"
import spotify_logo from "../assets/images/spotify_logo_white.svg"
import IconText from "../components/shared/IconText"
import TextWithHover from "../components/shared/TextWithHover"
import { Link, useNavigate } from "react-router-dom"
import { backendUrl } from "../utils/config";
import { useCookies } from 'react-cookie';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {Howl, Howler} from 'howler';
import songContext from "../contexts/songContext"
import SearchPage from "../routes/SearchPage"
import { PlaylistView } from "../routes/LoggedInHome"
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import SingleSongCard from "../components/shared/SingleSongCard"
import DropDown from "../components/shared/DropDown";



const LoggedInContainer = ({children,currActiveScrn,cardsData,limit}) => {
    Howler.volume(1.0);
    const [cookies, setCookie, removeCookie] = useCookies(['token']);
    const [isInputFocused,setIsInputFocused] = useState(false);
    
    const [searchText, setSearchText] = useState("");
    const [songData, setSongData] = useState([]);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [songDuration, setSongDuration] = useState(0);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [musicData, setMusicData] = useState([]);
    const {currentSong,setCurrentSong,songPlayed,setSongPlayed,isPaused,setIsPaused} = useContext(songContext);

  

    useEffect(()=>{
        const getData = async () =>{
            const response = await makeAuthenticatedGETRequest("/music/song");
            setMusicData(response.data);
            const initialSongId = currentSong?._id
            const initialIndex = musicData?.findIndex(song => song._id === initialSongId);
           

            setCurrentSongIndex(initialIndex);
            console.log("song index",currentSongIndex);
        };
        getData();
    },[currentSong]);
    useEffect(()=>{
        const getData = async () =>{
            const response = await makeAuthenticatedGETRequest("/music/album");
            setMusicData(response.data);
            const initialSongId = currentSong?._id;
            const initialIndex = musicData?.songs?.findIndex(song => song._id === initialSongId);
           

            setCurrentSongIndex(initialIndex);
        };
        getData();
    },[currentSong]);

    const searchSong = async () => {
        // This function will call the search api
        const response = await makeAuthenticatedGETRequest(
            `/music/song?search={"title":"${searchText}"}  `
        );
        setSongData(response.data);
    };
    
    
    
    // console.log("ganesh",currentSong);

    const firstUpdate = useRef(true);
    const animationRef = useRef();

    // const playlist = songData;

    // const currentSongIndex = currentSong ? playlist.findIndex((song) => song.id === currentSong.id) : -1;
    // console.log("index",currentSongIndex);

    const updateProgress = () => {
        if (songPlayed && songPlayed.playing()) {
            const currentTime = songPlayed.seek();
            if (currentTime !== null) {
                setCurrentTime(currentTime);
                setProgress((currentTime / songDuration) * 100);
            }
        }

      
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    useEffect(() => {
        animationRef.current = requestAnimationFrame(updateProgress);
        // Clear animation frame on component unmount
        return () => cancelAnimationFrame(animationRef.current);
    }, [songPlayed]);

    useLayoutEffect(()=>{
        //the following if statement will prevent the useEffect from running on the first render.
        if(firstUpdate.current){
            firstUpdate.current = false;
            return;
        }
        if(!currentSong){
            return;
        }
        // console.log("me");
        changeSong(currentSong.audio_url || currentSong.songs.audio_url);
    },[currentSong && currentSong.audio_url ||currentSong && currentSong.songs.audio_url]);

    const playSound = () =>{
        if(!songPlayed){
            return;
        }
        songPlayed.play();
    }

    const changeSong = (songSrc) =>{
        if(songPlayed){
            songPlayed.stop();
        }
        let sound = new Howl({
            src: [songSrc],
            html5: true,
            onend: () => {
                
                setCurrentTime(0);
                setIsPaused(true);
            },
            onplay: () => {
                
                setSongDuration(songPlayed?.duration());
                setCurrentTime(songPlayed?.seek());
                
                updateProgress();
            },
            
        });
        setSongPlayed(sound);
        sound.play();
        setIsPaused(false);
    };

    const pauseSound = () =>{
        if (songPlayed) {
            songPlayed.pause();
            setIsPaused(true);
        }
    };

    const togglePlayPause = () =>{
        if(isPaused){
            playSound();
            setIsPaused(false);
        }else{
            pauseSound();
            setIsPaused(true);
        }
    }
    const handleNext = () => {
        if (currentSongIndex !== null) {
            const nextIndex = (currentSongIndex + 1) % songData.length;
            setCurrentSongIndex(nextIndex);
            setCurrentSong(songData[nextIndex]);
          }
        
        // const currentIndex = currentSongIndex;
        // const nextIndex = (currentIndex + 1) % arrayLength.length; 
        // const nextSong = arrayLength[nextIndex];
    
        // setCurrentSong(nextSong);
        // setCurrentSong(currentSong+1);
    };
    
    const handlePrevious = () => {
        if (currentSongIndex !== null) {
            const previousIndex = (currentSongIndex - 1 + songData.length) % songData.length;
            setCurrentSongIndex(previousIndex);
            setCurrentSong(songData[previousIndex]);
          }
    
        // const currentIndex = currentSongIndex;
        // const previousIndex = (currentIndex - 1 + arrayLength.length) % arrayLength.length; 
        // const previousSong = arrayLength[previousIndex];

        // setCurrentSong(previousSong);
        setCurrentSong(currentSong-1);
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleSeek = (e) => {
        if (songPlayed ) {
            const seekTime = (e.target.value / 100) * songPlayed.duration();
            songPlayed.seek(seekTime);
            setCurrentTime(seekTime);
        }
    };

    const handleVolumeChange = (e) => {
        const volumeLevel = e.target.value / 100;
        songPlayed.volume(volumeLevel);
    };
    
    const navigate = useNavigate();
    const logOut = () =>{
        try {
            console.log("Logging out...");
            // removeCookie(['token']);
            localStorage.removeItem("token");
            // cookies.remove("token");
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }

    }

    // console.log("songDuration", songDuration);
    // console.log("currentTime", currentTime);

    // profile drop down start
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

//   
  

  return (
    <div className='h-full w-full bg-app-black'>
    <div className="h-9/10 w-full flex">
    {/* This div will be left part */}
        <div className='h-full w-1/5 bg-black flex flex-col justify-between pb-10'>
            {/* This div is for logo */}
            <div>
                <div className='logoDiv p-6'>
                    <img src={spotify_logo} alt="spotify logo" width={125}/>
                </div>
                <div className="py-2">
                    <IconText iconName={"material-symbols:home"} displayText={"Home"} targetLink={"/"} active={currActiveScrn === "home"}/>
                    <IconText iconName={"majesticons:search-line"} displayText={"Search"} targetLink={"/searchpage"} active={currActiveScrn === "search"}/>
                    <IconText iconName={"fluent:library-28-regular"} displayText={"Library"} targetLink={"/library"} active={currActiveScrn === "library"}/>
                    <IconText iconName={"mdi:music-box-multiple"} displayText={"My Music"} targetLink={"/mymusic"} active={currActiveScrn === "mymusic"}/>
                </div>
                <div className="pt-5">
                    <IconText iconName={"icon-park-solid:add"} displayText={"Create Playlist"}/>
                    <IconText iconName={"zondicons:heart"} displayText={"Liked Songs"}/>
                </div>
            </div>
            <div className="px-5">
                <div className="border border-gray-100 text-white w-1/3 flex px-2 py-1 rounded-full items-center justify-center hover:border-white cursor-pointer">
                    <Icon icon={"gis:earth"}/>
                    <div className="ml-2 text-sm font-semibold">English</div>
                </div>
            </div>
            
        </div>
        {/* This div will be the right part(main content) */}
        <div className='h-full w-4/5 bg-app-black overflow-auto'>
            { currActiveScrn === "search"?
                <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-center justify-between">
                    <div className={`w-1/3 p-3 text-sm rounded-full bg-gray-800 px-5 flex text-white space-x-3 items-center ml-8 ${isInputFocused ? "border border-white":""}`}>
                        <Icon icon="ic:baseline-search" className="text-lg"/>
                        <input type="text" placeholder="What do you want to listen to?" className="w-full bg-gray-800 focus:outline-none" onFocus={()=>{
                            setIsInputFocused(true);
                        }} onBlur={()=>{
                            setIsInputFocused(false);
                        }} value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                searchSong();
                            }
                        }}/>
                    </div>
                    {/* <SearchPage/> */}
                    <div className="w-1/3 flex h-full">
                        <div className="w-3/5 flex justify-around items-center">
                            {/* <TextWithHover displayText={"Premium"}/>
                            <TextWithHover displayText={"Support"}/> */}
                            {/* <div className="h-1/2 border-r border-white"></div> */}
                        </div>
                        <div className="w-2/5 flex justify-around h-full items-center">
                            
                            {/* <div className="bg-white text-lg px-4 flex items-center justify-center rounded-full font-light cursor-pointer" onClick={logOut}>
                                Log out
                            </div> */}
                            <div className="relative">
                                <div
                                    className="cursor-pointer bg-gray-200 rounded-full"
                                    onClick={toggleDropdown}
                                    onBlur={closeDropdown}
                                    tabIndex={0}
                                >
                                    {/* The icon or profile image that triggers the dropdown */}
                                    <Icon icon="gg:profile" className='w-7 h-7'/>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-10 right-0 bg-white p-4 shadow-md rounded-md">
                                    {/* Dropdown content, e.g., user options */}
                                    {/* <DropDown /> */}
                                        <div className="cursor-pointer text-gray-800 hover:bg-gray-200 p-2 rounded-md">Premium</div>
                                    

                                        <div
                                            className="cursor-pointer text-gray-800 hover:bg-gray-200 p-2 rounded-md"
                                            onClick={()=>{
                                                console.log("chandan");
                                                logOut()}}
                                        >
                                            Sign out
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* <DropDown/> */}
                        </div>
                    </div>
                </div>
                :<div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex items-center justify-end">
                    <div className="w-1/3 flex h-full">
                        <div className="w-3/5 flex justify-around items-center">
                            {/* <TextWithHover displayText={"Premium"}/>
                            <TextWithHover displayText={"Support"}/> */}
                            {/* <div className="h-1/2 border-r border-white"></div> */}
                        </div>
                        <div className="w-2/5 flex justify-around h-full items-center relative">
                            
                            {/* <div className="bg-white text-lg px-4 flex items-center justify-center rounded-full font-light cursor-pointer" onClick={logOut}>
                                Log out
                            </div> */}
                            <div className="relative">
                                <div
                                    className="cursor-pointer bg-gray-200 rounded-full"
                                    onClick={toggleDropdown}
                                    onBlur={closeDropdown}
                                    tabIndex={0}
                                >
                                    {/* The icon or profile image that triggers the dropdown */}
                                    <Icon icon="gg:profile" className='w-7 h-7'/>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-10 right-0 bg-white p-4 shadow-md rounded-md">
                                    {/* Dropdown content, e.g., user options */}
                                    {/* <DropDown /> */}
                                        <div className="cursor-pointer text-gray-800 hover:bg-gray-200 p-2 rounded-md">Premium</div>
                                    

                                        <div
                                            className="cursor-pointer text-gray-800 hover:bg-gray-200 p-2 rounded-md"
                                            onMouseEnter={()=>{console.log("chandan");logOut()}}
                                        >
                                            Sign out
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* <div className="bg-white text-lg flex items-center justify-center rounded-full font-light cursor-pointer inline-block" >
                                <Icon icon="gg:profile" className='w-7 h-7'/>
                            </div>
                            <div className="absolute bg-white p-4 w-52 shadow-lg left-14 top-24">
                                <ul>
                                    <li className="p-2 text-lg cursor-pointer rounded hover:bg-blue-100">Premium</li>
                                    <li className="p-2 text-lg cursor-pointer rounded hover:bg-blue-100">Log out</li>
                                </ul>
                            </div> */}
                            {/* jbjbkjjb */}
                            {/* <DropDown/> */}
                            {/* mb */}
                        </div>
                    </div>
                </div>
            }
            {
                currActiveScrn==="search"?(<div className="content p-8 pt-0 flex flex-col ">
                    {/* {children} */}
                    
                    {songData.length > 0 ? (
                    <div className="pt-10 space-y-3">
                        <div className="text-white">
                            Showing search results for
                            <span className="font-bold"> {searchText}</span>
                        </div>
                        {songData?.map((item) => {
                            return (
                                <SingleSongCard
                                    info={item}
                                    key={JSON.stringify(item)}
                                    playSound={() => {}}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-gray-400 pt-10">
                        Nothing to show here.
                    </div>
                )}
                </div>):
                (<div className="content p-8 pt-0 flex flex-col justify">
                    {children}
                    
                    {/* {cardsData?.length>0 && <PlaylistView titleText={"Focus"} cardsData={cardsData} limit={currActiveScrn==="home"?cardsData.length===4:cardsData.length}/>} */}
                </div>
                )
            }
        </div>
        </div>
        {/* current playing song div */}
        <div className="w-full h-1/10 bg-black bg-opacity-30 text-white flex items-center px-4">
            <div className="w-1/4 flex items-center">
                <img src={currentSong?.thumbnail} alt="currentSongThumbnail" className="h-14 w-14 rounded"/>
                <div className="pl-4">
                    <div className="text-sm hover:underline cursor-pointer">{currentSong?.title}</div>
                    <div className="text-xs text-gray-500 hover:underline cursor-pointer">{currentSong?.artist?.length > 0 && currentSong?.artist[0].name}</div>
                </div>
            </div>
            <div className="w-1/2 h-full flex justify-center flex-col items-center">
                <div className="flex w-1/3 justify-between items-center">
                    {/* song control */}
                    <Icon icon="ph:shuffle-light" fontSize={30} className="cursor-pointer text-gray-500 hover:text-white"/>
                    <Icon icon="ic:baseline-skip-previous" fontSize={30} className="cursor-pointer text-gray-500 hover:text-white" onClick={()=>handlePrevious(currentSong)}/>
                    <Icon icon={isPaused?"ic:baseline-play-circle":"ic:baseline-pause-circle"} fontSize={40} className="cursor-pointer text-gray-500 hover:text-white"
                        onClick={togglePlayPause}
                    />
                    <Icon icon="ic:baseline-skip-next" fontSize={30} className="cursor-pointer text-gray-500 hover:text-white" onClick={()=>handleNext(currentSong)}/>
                    <Icon icon="ph:repeat-light" fontSize={30} className="cursor-pointer text-gray-500 hover:text-white"/>
                </div>
                {/* <div>progress bar</div> */}
                <div className="progress w-full flex justify-center  items-center">
                    <span className="time current">{formatTime(currentTime)}</span>
                    <input type="range" className="w-1/2" min="0" max={songPlayed?.duration()} step="1" value={currentTime} onChange={handleSeek}/>
                    <span className="time">{formatTime(songPlayed?.duration())}</span>
                </div>
            </div>
            <div className="w-1/4 flex justify-end">
                <div className="w-full flex justify-end  items-center ">
                    <input type="range" className="w-1/2 cursor-pointer"  onChange={handleVolumeChange}/>
                    <Icon icon="mingcute:volume-fill" fontSize={30} className="cursor-pointer text-gray-500 hover:text-white"/>
                </div>
            </div>
        </div>
    </div>
  )
};



export default LoggedInContainer