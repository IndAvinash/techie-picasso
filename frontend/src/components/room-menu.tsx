import { Children } from "react";

type MemberProps={
 id:string,
 name:string,
 roomId:string
}

function Member({id,name,roomId}:MemberProps){
    const Kick = (id:string,roomid:string)=>{
        // check if request is made by owner and member is in room and remove
    }
    return(
        <li>{name}
        <div className="divider"></div>
        <button onClick={()=>Kick(id,roomId)}>Kick</button>
        </li>
    )
}
export default function RoomManager(){
    const users: MemberProps[] = [
  { id: "1", name: "Aman",roomId:"" },
  { id: "2", name: "Riya", roomId:"" }
];
    return(
        <>
        <div className="roomManager">
            <div className="roomCard">
            <button className="btn-primary">Create Room</button>
           <div className="h-divider"></div>
            <div className="members">
                <ul>
                {users.map((user)=>(
                    <Member id={user.id} key={user.id} name={user.name} roomId={user.roomId}></Member>
                ))

                }
                </ul>
            </div>
            </div>
        </div>
        </>
    )
}