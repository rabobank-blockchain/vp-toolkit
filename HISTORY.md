# 0.2.3 / 24-03-2020

**Enhancements**
- Updated deps and downgraded Typescript 3.4.5 to ensure compatible `d.ts` files

# 0.2.1 / 09-01-2020

**Enhancements:**
- Updated all dependencies, fixed [CVE-2019-19919](https://github.com/advisories/GHSA-w457-6q6x-cgp9)
- Introduced [HISTORY.md](HISTORY.md)

# 0.2.0 / 24-12-2019

**BREAKING**

- Updated to `vp-toolkit-models@0.2.0`, introducing a new mandatory field: `postEndpoint`. You need to add this field when using the [`generateChallengeRequest()`](https://github.com/rabobank-blockchain/vp-toolkit/blob/fa8b5ee8351ce3b45302a8fd7a0297b39c511035/src/service/generators/challenge-request-generator.ts#L40) method.
*Example:*
```ts
challengeRequestGenerator.generateChallengeRequest({
      toAttest: [
        { predicate: 'https://schema.org/givenName' },
        { predicate: 'https://schema.org/familyName' }
      ],
      toVerify: [
        { predicate: 'https://schema.org/initials' }
      ],
      postEndpoint: 'https://domain.org/ssif/verifiable-presentation-endpoint', // <--- New field
      correspondenceId: '1e66fc69-05c6-4692-aa84-80eaacbf4bcc',
      proof: testProof
    },
    0, 0
)
```

# 0.1.2 / 08-01-2020

**Enhancements**
- Updated `crypt-util` lib to fix a [Timing Attack vulnerability](https://app.snyk.io/vuln/SNYK-JS-ELLIPTIC-511941)
- Applied interface rename for all models as proposed vp-toolkit-models
- Updated several dependencies

# 0.1.0 / 20-09-2019

*Initial release*
