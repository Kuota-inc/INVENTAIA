# Stage 1: Build Kuota Spring Boot API
FROM gradle:8.5-jdk17 AS builder
WORKDIR /home/gradle/kuota-api
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# Stage 2: Runtime Container
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /home/gradle/kuota-api/build/libs/*.jar /app/kuota-api.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/kuota-api.jar"]
