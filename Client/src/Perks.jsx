export default function Perks({selected,onChange}){
    function handleCbClick(ev){
      const {checked,name} = ev.target;
      if(checked){
        onChange([...selected,name]);
      }
      else{
        onChange([...selected.filter(selectedName => selectedName !== name)])
      }
      
    }
    return(
        <>
          <label className="border p-3 ">
                        <input type="checkbox" checked={selected.includes("wifi")} name="wifi" onChange={handleCbClick}/>
                        <span>Wifi</span>
                        </label>  
                        <label className="border p-3 ">
                        <input type="checkbox" checked={selected.includes("parking")} name="parking" onChange={handleCbClick}/>
                        <span>Free parking slot</span>
                        </label> 
                        <label className="border p-3 ">
                        <input type="checkbox" checked={selected.includes("tv")} name="tv" onChange={handleCbClick}/>
                        <span>Tv</span>
                        </label> 
                        <label className="border p-3 ">
                        <input type="checkbox" checked={selected.includes("radio")} name="radio" onChange={handleCbClick}/>
                        <span>Radio</span>
                        </label> 
                        <label className="border p-3 ">
                        <input type="checkbox" checked={selected.includes("ac")} name="ac" onChange={handleCbClick}/>
                        <span>Ac</span>
                        </label> 
                        <label className="border p-3 ">
                        <input type="checkbox" checked={selected.includes("entrance")} name="entrance" onChange={handleCbClick}/>
                        <span>Private entrance</span>
                        </label>
        </>
    )
}