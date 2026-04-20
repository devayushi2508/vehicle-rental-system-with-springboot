package com.vehiclerental;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import de.flapdoodle.embed.mongo.MongodExecutable;
import de.flapdoodle.embed.mongo.MongodProcess;
import de.flapdoodle.embed.mongo.MongodStarter;
import de.flapdoodle.embed.mongo.config.MongodConfig;
import de.flapdoodle.embed.mongo.config.Net;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.process.runtime.Network;

public abstract class MongoTestSupport {

    private static final int MONGO_PORT = 27018;
    private static final String MONGO_URI = "mongodb://localhost:" + MONGO_PORT + "/rentalsysdb-test";
    private static MongodExecutable mongodExecutable;
    private static MongodProcess mongodProcess;

    static {
        try {
            MongodStarter starter = MongodStarter.getDefaultInstance();
            MongodConfig config = MongodConfig.builder()
                    .version(Version.V4_4_17)
                    .net(new Net(MONGO_PORT, Network.localhostIsIPv6()))
                    .build();
            mongodExecutable = starter.prepare(config);
            mongodProcess = mongodExecutable.start();
        } catch (Exception exception) {
            throw new RuntimeException("Failed to start embedded MongoDB", exception);
        }
    }

    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.mongodb.uri", () -> MONGO_URI);
    }

}