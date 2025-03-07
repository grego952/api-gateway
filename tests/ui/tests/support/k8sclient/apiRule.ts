import { postApis } from "./httpClient";
import { loadFixture } from "./loadFile";

export type ApiRuleAccessStrategy = "oauth2_introspection" | "jwt" | "noop" | "allow" | "no_auth"

export type ApiRuleConfig = {
    name: string,
    namespace: string;
    service: string;
    host: string;
    handler: ApiRuleAccessStrategy;
    config?: JwtConfig | OAuth2IntroConfig | null;
    gateway?: string | null;
}

export type ApiRuleV2alpha1Config = {
    name: string,
    namespace: string;
    service: string;
    host: string;
    gateway?: string | null;
}

type JwtConfig = {
    jwks_urls: string[];
    trusted_issuers: string[];
}

type OAuth2IntroConfig = {
    required_scope: string[];
}

type ApiRule = {
    apiVersion: string;
    metadata: {
        name: string;
        namespace: string;
    }
    spec: {
        service: {
            name: string;
        }
        host: string;
        gateway: string;
        rules: {
            path: string;
            methods: string[];
            accessStrategies: {
                handler: ApiRuleAccessStrategy;
                config?: JwtConfig | OAuth2IntroConfig | null;
            }[];
        }[];
    }
}

type ApiRuleV2alpha1 = {
    apiVersion: string;
    metadata: {
        name: string;
        namespace: string;
    }
    spec: {
        service: {
            name: string;
        }
        hosts: string[];
        gateway: string;
        rules: {
            path: string;
            methods: string[];
        }[];
    }
}

Cypress.Commands.add('createApiRule', (cfg: ApiRuleConfig) => {
    // @ts-ignore Typing of cy.then is not good enough
    cy.wrap(loadFixture('apiRule.yaml')).then((a: ApiRule): void => {
        a.metadata.name = cfg.name;
        a.metadata.namespace = cfg.namespace;
        a.spec.service.name = cfg.service;
        a.spec.host = cfg.host;
        if (cfg.gateway != null) {
            a.spec.gateway = cfg.gateway;
        }
        a.spec.rules[0].accessStrategies = [
            {
                handler: cfg.handler,
                config: cfg.config
            }
        ]

        // We have to use cy.wrap, since the post command uses a cy.fixture internally
        cy.wrap(postApis(`${a.apiVersion}/namespaces/${cfg.namespace}/apirules`, a)).should("be.true");
    })
});

Cypress.Commands.add('createApiRuleV2alpha1', (cfg: ApiRuleV2alpha1Config) => {
    // @ts-ignore Typing of cy.then is not good enough
    cy.wrap(loadFixture('apiRuleV2alpha1.yaml')).then((a: ApiRuleV2alpha1): void => {
        a.metadata.name = cfg.name;
        a.metadata.namespace = cfg.namespace;
        a.spec.service.name = cfg.service;
        a.spec.hosts = [cfg.host];

        // We have to use cy.wrap, since the post command uses a cy.fixture internally
        cy.wrap(postApis(`${a.apiVersion}/namespaces/${cfg.namespace}/apirules`, a)).should("be.true");
    })
});