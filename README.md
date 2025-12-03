<!-- PROJECT BANNER -->
<p align="center">
  <img src="https://svg-banners.vercel.app/api?type=glitch&text1=PRINTVERSE&text2=Natural-Language%20Printing&width=1000&height=300" alt="Printverse Banner"/>
</p>

<p align="center">
  <strong>Natural-language printing, simplified.</strong><br>
  Type instructions like “print 10 pages double-sided” and Printverse generates the configuration automatically.
</p>

<p align="center">
  <a href="https://www.print-verse.com"><b>Live Website</b></a>
</p>

---

## BLUF (Bottom Line Up Front)
Printverse is a full-stack MERN application that interprets natural-language printing instructions and converts them into structured print settings.  
It reduces time, removes repetitive configuration steps, and simplifies printing for students and teams.  
Fully deployed on a Google Cloud Platform VM with a custom domain and CI/CD pipeline.

---

## Navigation
<p align="center">

<a href="https://github.com/ssasaki1/PRODUCT-TEAM-7-CIS-486-printverse/wiki/Proposal"><b>Proposal</b></a> |
<a href="https://github.com/ssasaki1/PRODUCT-TEAM-7-CIS-486-printverse/wiki/System%E2%80%90Design"><b>System Design</b></a> |
<a href="https://github.com/ssasaki1/PRODUCT-TEAM-7-CIS-486-printverse/wiki/Value%E2%80%90Chain"><b>Value Chain</b></a> |
<a href="https://github.com/ssasaki1/PRODUCT-TEAM-7-CIS-486-printverse/wiki/Process"><b>Process</b></a> |
<a href="https://github.com/ssasaki1/PRODUCT-TEAM-7-CIS-486-printverse/wiki/Project-Board-Overview"><b>Project Board</b></a> |
<a href="https://github.com/ssasaki1/PRODUCT-TEAM-7-CIS-486-printverse/wiki/Sprint99"><b>Future Scope</b></a>

</p>

---

## Features
- Natural-language instruction parsing  
- User authentication and personalized presets  
- CRUD operations for print configurations  
- Clean React interface for editing and managing settings  
- OpenAI-powered parsing demonstration  
- GCP VM deployment with custom domain  
- CI/CD via GitHub Actions  
- Modular backend architecture (routes, models, services)

---

## Architecture

### Frontend
- React  
- State management with hooks  
- REST API communication  
- Clean minimal UI  

### Backend
- Node.js / Express  
- JWT authentication  
- Mongoose models  
- Modular routing and controllers  

### NLP Layer
- OpenAI API used to test and evaluate command parsing logic  

### Infrastructure / Deployment
- Google Cloud Platform (Compute Engine VM)  
- Nginx reverse proxy  
- PM2 process manager  
- GitHub Actions CI/CD pipeline  
- Custom domain (print-verse.com) via DNS A-record mapping  

---

## Tech Stack
<p align="center">

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenAI_API-412991?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white"/>
<img src="https://img.shields.io/badge/PM2-2F93E0?style=for-the-badge"/>
<img src="https://img.shields.io/badge/GCP_Compute_Engine-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"/>

</p>

---

## How It Works
Printverse uses a React interface where users type instructions.  
The backend parses them (OpenAI for initial testing), stores settings in MongoDB, and allows editing or saving presets.  
The GCP VM hosts both the client and server using Nginx and PM2 for production reliability.

---

## Value Delivered
Printverse reduces the cognitive load and time wasted on printer setting menus by enabling users to write their intent in plain English.  
It introduces speed, accessibility, automation, and consistency to the printing workflow.

---

## Team
Garvit | Prayanshu | Shun | Barry Cumbie  
