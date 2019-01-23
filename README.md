# OpenShift Admission Webhooks
This repository intends to host a few applications (aka __Webhook Servers__) to be used as example of Admission Webhooks for OpenShift.

## What is an Admission Webhook?
Admission Webhooks call Webhook Servers to either mutate pods upon creation, such as to inject labels, or to validate specific aspects of the pod configuration during the admission process.

Admission Webhooks intercept requests to the master API prior to the persistence of a resource, but after the request is authenticated and authorized.

![api request lifecycle][diagram]

There are two types of Admission Webhook objects you can configure:
- _Mutating Admission Webhooks_ allow for the use of mutating webhooks to modify resource content before it is persisted.
- _Validating Admission Webhooks_ allow for the use of validating webhooks to enforce custom admission policies.

## Enabling Admission Webhooks
In order to use these _Mutating Admission Webhooks_ and _Validating Admission Webhooks_ they must be activated in OpenShift master services.

Make sure that `/etc/origin/master/master-config.yaml` has this two plugins enabled in `admissionConfig.pluginConfig` section, and restart master services:
~~~
    ValidatingAdmissionWebhook:
      configuration:
        apiVersion: v1
        disable: false
        kind: DefaultAdmissionConfig
    MutatingAdmissionWebhook:
      configuration:
        apiVersion: v1
        disable: false
        kind: DefaultAdmissionConfig
~~~

## List of Webhooks Servers
This is the list of the Webhook Servers included in the repository:
- __[denynewpods](./denynewpods/README.md)__. This webhook is an example of a _Validating Admission Webhook_ and will prevent to run any kind of pod in a namespace labeled with the label `denynewpods.admission.online.openshift.io` to a value `enabled`.
- __enforceenv__. __TODO__: This webhook is an example of a _Mutating Admisson Webhook_ and will add a set of environment variables in any new pod, based on a label in the namespace (`enforceenv.admission.online.openshift.io`).
- __enforcesecret__. __TODO__: This webhook is an example of a _Mutating Admission Webhook_ and will mount a given secret in any new pod a given secret. This can be used in example to share a common root CA in all pods so it can be used from any application running on them.

All Webhook Servers in this repository:
- are built using OpenShift build methods.
- listen in port 8443 for HTTPS (POST) requests.
- use the Service Signer CA to get a secret with a certificate and a key. You should be able to overwrite the content of the secret after its creation if you want to use your own CA and certificates.
- are referred using their service DNS name. Other methods can be used like integrating the service in OpenShift API, using a service and namespace reference or even a secured route.

Refer to each Webhook Server's README file to get more details about it.

## Contribute
Contact me if you want to help in creating new examples or you find any issue in the examples.

Before sending a PR, please make sure you:
 - have created a directory structure for your new example
 - have created templates to create all the resources in OpenShift (including the build, which is mandatory to be done in OpenShift for all this repository examples)
 - have created a README.md based on [denynewpods README.md](./denynewpods/README.md) explaining how the Webhook Server works, how the Admission Webhook is expected to work and how to configure the behavior (if that is possible).

## Links
- [Custom Admission Controllers](https://docs.openshift.com/container-platform/3.11/architecture/additional_concepts/dynamic_admission_controllers.html)
- [Admission Webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#admission-webhooks)

[diagram]: https://2.bp.blogspot.com/-p8WGg2BATsY/WlfywbD_tAI/AAAAAAAAAJw/mDqZV0dB4_Y0gXXQp_1tQ7CtMRSd6lHVwCK4BGAYYCw/s1600/Screen%2BShot%2B2018-01-11%2Bat%2B3.22.07%2BPM.png
