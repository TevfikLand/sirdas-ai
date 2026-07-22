import { Line,LineChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
import { Activity } from "lucide-react";
import { useEffect,useState } from "react";
import { api } from "../api/client";

type Point={date:string;score:number};
export function MoodHistoryPage(){const[data,setData]=useState<Point[]>([]);useEffect(()=>{api<Point[]>("/entries/mood-history").then(setData)},[]);return <div className="content-page"><header className="page-header"><div><span className="eyebrow">Zaman içindeki yansımanız</span><h1>Ruh hali geçmişi</h1></div></header>{data.length?<section className="chart-panel"><ResponsiveContainer width="100%" height={380}><LineChart data={data}><CartesianGrid strokeDasharray="3 6" stroke="#d7d1c4"/><XAxis dataKey="date" tick={{fill:"#5f625e"}}/><YAxis domain={[0,100]} tick={{fill:"#5f625e"}}/><Tooltip/><Line type="monotone" dataKey="score" stroke="#c7603d" strokeWidth={3} dot={{r:4,fill:"#23443e"}}/></LineChart></ResponsiveContainer><p className="medical-note">Bu grafik yalnızca günlük analizlerinden elde edilen genel bir eğilimi gösterir; klinik bir ölçüm değildir.</p></section>:<div className="empty-state large"><Activity/><h2>Henüz bir eğri oluşmadı.</h2><p>AI analizi etkinleştirildiğinde tamamlanan günlüklerinizin zaman içindeki yansıması burada görünecek.</p></div>}</div>}
