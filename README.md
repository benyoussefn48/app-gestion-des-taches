db : XAMPP
auth-service : service d'authentification (Node + Express + JWT)
task-service : CRUD des tâches (Node + Express) 
api-gateway : gateway (Node + Express )
frontend :react
instal docker  
1. Construire et démarrer :
    docker-compose up --build
Tester endpoints via gateway:
    Register :
        curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"username":"alice","password":"pass123"}'
    Login:
        curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"pass123"}'
2. Si la route ne répond pas
    docker logs auth-service # Affiche les logs Auth-service
3. arrete docker puis relance 
    docker compose down
4.  cd frontend   
5. run react 
    npm start
