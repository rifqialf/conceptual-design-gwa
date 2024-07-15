# Introduction
This repository is part of MSc Thesis titled "A Model-Driven Approach for Developing REST-Based Geospatial Web Application Using UML Profiles" by Rifqi Alfadhillah Sentosa, defended at ITC University of Twente in July 2024

# Abstract
The development of geospatial web applications (GWAs) has seen significant advancements, one of which is with Model-Driven Development (MDD) and Model-Driven Architecture (MDA). MDA provides a systematic transformation of high-level models into executable computer code of applications, which provides a significant value as a development methodology for web application.

This study focuses on leveraging the development process of REST-based GWAs using Unified Modelling Language (UML) profiles and used it within MDA framework. The research aims to streamline GWA development, enabling users with inadequate level of web application development skills to a running REST-based GWA for their use case. However, the current state-of-the-art in GWA development lacks a standardized, reproducible approach that integrates UML profiles with MDA for REST-based architectural style. This gap limits the accessibility and scalability of GWA development for non-expert users.

This thesis proposed a new development approach that integrates UML profiles into the MDA framework for developing REST-based GWAs. This study involved collecting common functions from existing GWAs, analysing their functional requirements, and developing corresponding UML profiles. These profiles were then used to create Platform Independent Models (PIMs) and Platform Specific Models (PSMs), which were transformed into executable code.

The methodology was demonstrated through a detailed implementation process, resulting in a reproducible approach for developing GWAs. Several findings include the successful creation of UML profiles that capture common GWA functionalities and the development of efficient model transformation rules using the proposed approach.

The proposed approach lowers the barrier for GWA development, enabling GIS/RS practitioners and developers to create customized web applications with minimal coding effort. This approach enhances the scalability and accessibility of GWA development, potentially leading to broader adoption and innovation in the field of REST-base geospatial web applications.  

**Keywords**: Geospatial Web Application, Model Driven Development, Model Driven Architecture, UML, REST API, OGC API Standards

# Repository Structure
## PIM Profiles
In directory `/mda-demo/mda/pim-profiles` the transformation scripts for PIM-to-PSM and PSM-to-code can be found and used.

### MVC Separation of Concerns for the UML profiles
Figure below illustrates how UML profiles for buidling PIM implements MVC design pattern for separation of concerns.
<img width="800" alt="Thesis - UML Diagram (98)" src="https://github.com/user-attachments/assets/5c79fcb0-f99c-4dcb-9004-81e5cbc0a131">

### PIM Model Profile
Figure below illustrates pimModelCore.json containing stereotypes that user can use to design their PIM.
<img width="800" alt="Thesis - UML Diagram (99)" src="https://github.com/user-attachments/assets/d6bc8aea-ca15-4f58-b8af-30f5b64ea734">

### PIM View Profile
Figure below illustrates pimViewCore.json containing stereotypes that user can use to design their PIM.
<img width="800" alt="Thesis - UML Diagram (100)" src="https://github.com/user-attachments/assets/20cbdd9f-9df8-43b0-b422-53a8313b767c">

### PIM Controller Profile
Figure below illustrates pimControllerCore.json containing stereotypes that user can use to design their PIM.
<img width="800" alt="Thesis - UML Diagram - 2024-07-15T091616 560" src="https://github.com/user-attachments/assets/6845e190-0c6c-4cb3-b8ea-0c4523b902fd">

## PSM Profiles
In directory `/mda-demo/mda/psm-profiles` the transformation scripts for PIM-to-PSM and PSM-to-code can be found and used.
Figure below illustrates how the UML profiles for PSM development are structured based on MVC design pattern.
<img width="800" alt="Thesis - UML Diagram (93)" src="https://github.com/user-attachments/assets/40961c00-f355-46f8-a59d-3870f2051fd1">

## Transformation Scripts
In directory `/mda-demo/mda/transformation` the transformation scripts for PIM-to-PSM and PSM-to-code can be found and used.

# How to Use
