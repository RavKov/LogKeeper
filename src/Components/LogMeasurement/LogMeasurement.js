import { useState, useEffect } from "react";
import LogTable  from "./LogTable/LogTable";
import styles from "./LogMeasurement.module.css";


const LogMeasurement = (props) => {
    
    const [length, setLength] = useState('');
    const [diameter, setDiameter] = useState('');
    const [project, setProject] = useState("NO DATA");
    const [woodpile, setWoodpile] = useState("NO DATA");
    const [logsData, setLogsData] = useState(null); // array of all logs
    const [woodpilesProjectsData, setWoodpilesProjectsData] = useState(null); // format [{woodpile, project}]
    const [projectsData, setProjectsData] = useState(null);
    const [woodpilesData, setWoodpilesData] = useState(null);
    const [logCount, setLogCount] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);
    const [id, setId] = useState(props.id); 

    const calculateVolume = (length, diameter) => {
        const radius = diameter/100/2;
        return Math.round((3.14*radius*radius*length)*1000)/1000;
    } 
    

    //SEND LOGS AND MEASUREMENTS HANDLER
    const sendLogs = async (event) => {
    
        if(logCount===0) {
            alert("You need to add at least one log before sending it to the server!");
            throw new Error("No data to send!");
            
        }
        const toSend = [...logsData];

        //Adding some metadata for remaining database fields
        toSend.unshift(
            {
                measurementPurpose: "buying",
                volume: totalVolume,
                count: logCount,
                logLength: length
            }
        );

        //Final request
        const response = await fetch("http://localhost:3005/sendLogMeasurement", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(toSend)
        });

        const data = await response.json();
        console.log("response: ", data);

        //zeroing data because you cant modify sent measurement (at least not right now)
        
        setDiameter('');
        setLength('');
        setTotalVolume(0);
        setLogCount(0);
        setLogsData(null);
    }

    //loading data at start
    const getWoodpiles = async () => {
        
        const response = await fetch("http://localhost:3005/getWoodpiles", {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        const data = await response.json();

        setWoodpilesProjectsData(data);
        
        
        let tempArray = [];

        for (const item of data) {
            if (!tempArray.includes(item.projectName)){
                tempArray.push(item.projectName);
            }
        }

        setProjectsData(tempArray);
        setProject(tempArray[0]);
        console.log("tempArray", tempArray);
        console.log("data", data);

    }

    useEffect(()=>{
        if (woodpilesProjectsData) {
            const tempWoodpilesData = [...woodpilesProjectsData.filter(item => item.projectName==project).map(item => item.woodpileNumber)];
            setWoodpilesData(tempWoodpilesData);
            
            setWoodpile(tempWoodpilesData[0]);
        }
        
    }, [project])

    useEffect(()=>{
        getWoodpiles();

    },[]);



    //ADD LOG HANDLER
    const addLog = (event) => {
        setLogCount(logCount+1);
        event.preventDefault();
        if (!length || !diameter) {
            console.log("NO REQUIRED DATA");
            return 0;
        }

        const newLog = {
            logNumber: logCount+1, 
            logLength: length,
            logDiameter: diameter, 
            logVolume: calculateVolume(length, diameter),
            logProject: project,
            logWoodpile: woodpile,
            logMeasurementPurpose: props.measurementPurpose
        }
        
        console.log("number: ", newLog.logNumber);

        setDiameter('');
        console.log(Math.round(newLog.logVolume*1000)/1000)
        setTotalVolume(Math.round((totalVolume+newLog.logVolume)*1000)/1000);
        if (logCount===0) setLogsData([newLog]);
        else setLogsData([newLog, ...logsData]);

        document.getElementsByName("diameterInput")[0].focus();
    }

    // DELETE LOG HANDLER 
    const deleteLog = (number) => {
        
        //Creating temporary array, deleting an element and then updating numbers
        let newData = [...logsData];
        console.log("delete", number);
        newData = newData.filter(log => log.logNumber != number);
        newData = newData.map((log,index) => ({...log, logNumber: newData.length-index}));
        setLogsData(newData);
        setLogCount(logCount-1);

        //Updating totalVolume (previous one is outdated because there is 1 log less)
        let newVolume = newData.reduce((total, current) => total+ Number(current.logVolume), 0);
        newVolume = Math.round(newVolume*1000)/1000;
        console.log(newVolume);
        setTotalVolume(newVolume);
        
        //If we are deleting the last log then I am refreshing the state to default
        if(logCount==1) {
            setDiameter('');
            setLength('');
            setTotalVolume(0);
            setLogCount(0);
            setLogsData(null);
        }
    }

    

    const onProjectChange = (event) => {
        setProject(event.target.value);

    }


    return (
        <div className={styles.logMeasurement}>
            <button className={styles.sendButton} name="sendLogs" onClick={sendLogs}>SEND LOGS TO DATABASE</button>
            
            <form onSubmit={addLog} className={styles.logMeasurementForm}>
                <label><span>Length</span>
                {
                //quite unelegant approach, I should make separate input Component for length
                !logCount &&
                    <input
                    min={0}
                    step="0.01"
                    className="lengthInput"
                    type="number" 
                    required
                    placeholder="length [m]" 
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                    />
                }

                {logCount==0 ? "" : 
                    <input
                    min={0}
                    step="0.01"
                    className="lengthInput"
                    type="number" 
                    readOnly
                    placeholder="length [m]" 
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                    />
                }
                </label>

                <label>Diameter
                <input
                    min={0}
                    step="1"
                    className="diameterInput"
                    name="diameterInput"
                    type="number" 
                    required
                    placeholder="diameter [cm]" 
                    value={diameter}
                    onChange={(event) => setDiameter(event.target.value)}
                />
                </label>

                <label>Project
                <select
                    value={project}
                    required
                    onChange={(event) => setProject(event.target.value)}
                >
                    {projectsData && projectsData.map(project => (
                        <option key={project} value={project}>
                        {project}
                        </option>
                    ))}
                </select>
                </label>

                <label>Woodpile
                <select
                    value={woodpile}
                    
                    onChange={(event) => setWoodpile(event.target.value)}
                >

                    {woodpilesData && woodpilesData.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                    
                </select>
                </label>
                <button>ADD LOG</button>
            </form>
            
            <p id="totalVolume">Total volume: {totalVolume}</p>
            
            
            {logsData && <LogTable interactive={props.interactive} deleteLog={deleteLog} data={logsData}/>}
            {!logsData && <div>No data to load, add at least one log 😃</div>}
            
        </div>
    );
}

export default LogMeasurement;