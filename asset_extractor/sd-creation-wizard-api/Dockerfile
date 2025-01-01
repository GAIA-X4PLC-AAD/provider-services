# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-11 AS build
COPY pom.xml ./
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM adoptopenjdk/openjdk11:alpine-jre
ARG JAR_FILE=target/creation-wizard-api.jar
COPY --from=build ${JAR_FILE} /app.jar
COPY shapes/ /shapes/
ENTRYPOINT ["java", "-jar", "/app.jar"]
