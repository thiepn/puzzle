## Maintenance change

### Why is this change needed?

<!-- Link the issue or describe the reproducible defect / compatibility / accessibility / security / performance reason. -->

### Scope classification

- [ ] Bug fix
- [ ] Browser/device compatibility
- [ ] Accessibility
- [ ] Security
- [ ] Performance/reliability
- [ ] Content/data correction
- [ ] CI/tooling/docs only
- [ ] Explicitly approved feature work

### Regression evidence

<!-- Name the test or certification that proves the change. -->

- [ ] Focused regression coverage added or strengthened
- [ ] Relevant focused test passes

### Storage / backup impact

- [ ] No persistence-format change
- [ ] IndexedDB compatibility reviewed
- [ ] Backup compatibility reviewed
- [ ] Recovery gate is relevant and passes

Explain any schema or migration change:

### Release identity

- [ ] Runtime files unchanged; version/cache intentionally unchanged
- [ ] Runtime files changed; app/service-worker/cache/release manifest/docs advanced together

### Required gates

- [ ] Release gate
- [ ] Player fuzz shards 1–4
- [ ] Chromium / Firefox / WebKit resilience
- [ ] Endurance
- [ ] Recovery
- [ ] QoL keyboard/mobile

### Manual-device claims

- [ ] This PR makes no unverified physical-device claim
- [ ] Physical-device evidence is documented

### Rollback

Previous known-good commit / release:

Rollback considerations:
