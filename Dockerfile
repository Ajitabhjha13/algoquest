# =========================================================
# AlgoQuest API: Docker image (Render isi se build karta hai)
# Do stage: pehle Maven se JAR banao, phir sirf JAR ko chhoti Java image mein chalao
# =========================================================

# ---------- Stage 1: Build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Pehle sirf pom.xml: dependencies cache ho jaati hain, agli baar build tez
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
# Tests skip: default contextLoads test ko database chahiye, build ke waqt DB nahi hota
RUN mvn -B -q package -DskipTests

# ---------- Stage 2: Run ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render free = 512 MB RAM: Java ko memory ka 75% hi use karne do
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

EXPOSE 8080
# Render apna port PORT env var mein deta hai; local pe 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
