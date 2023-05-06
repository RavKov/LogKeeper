import styles from './LogTable.module.css';

const LogTable = (props) => {
    
    return (
    <table className={styles.logTable}>
        <thead>
            <tr>
                <th className={styles.logHeaderCell}>No</th>
                <th className={styles.logHeaderCell}>Len</th>
                <th className={styles.logHeaderCell}>Diam</th>
                <th className={styles.logHeaderCell}>M3</th>
                <th className={styles.logHeaderCell}>Proj</th>
                <th className={styles.logHeaderCell}>Woodpile</th>
            </tr>
        </thead>
        <tbody>
            {props.data.map(item => (
                <tr key={item.logNumber}>
                    <td className={styles.logCell}>{item.logNumber}</td>
                    <td className={styles.logCell}>{item.logLength}</td>
                    <td className={styles.logCell}>{item.logDiameter}</td>
                    <td className={styles.logCell}>{item.logVolume}</td>
                    <td className={styles.logCell}>{item.logProject}</td>
                    <td className={styles.logCell}>{item.logWoodpile}</td>
                    {
                        props.interactive=="yes" &&
                        <td className={styles.deleteCell + " " + styles.logCell} onClick={()=>props.deleteLog(item.logNumber)} >DELETE</td>
                    }
                    
                </tr>
            ))}
        </tbody>
    </table>
    );
}

export default LogTable;