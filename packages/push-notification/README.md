# @zcatalyst/push-notification

JavaScript SDK for Catalyst Push Notification - Mobile and Web Notifications

## Overview

The `@zcatalyst/push-notification` package provides JavaScript/TypeScript methods to send [Catalyst Push Notifications](https://docs.catalyst.zoho.com/en/cloud-scale/help/push-notification/introduction/) to mobile apps (iOS/Android) and web applications.

**Catalyst Push Notification** enables real-time user engagement through push notifications, helping you keep users informed and engaged with timely updates.

### Key Features

- **Mobile Notifications**: Send to iOS and Android devices
- **Web Notifications**: Browser push notifications
- **User Targeting**: Send to specific users or broadcast
- **Rich Content**: Include titles, messages, images, and actions
- **Delivery Tracking**: Monitor notification delivery status
- **Silent Notifications**: Background data updates
- **Real-Time**: Instant notification delivery
- **Deep Linking**: Direct users to specific app screens

### Use Cases

- Send alerts and reminders
- Notify users of updates and changes
- Marketing campaigns and promotions
- Order status updates
- Chat and messaging notifications
- Breaking news alerts
- System notifications
- User engagement campaigns

### Prerequisites

- A [Catalyst project](https://docs.catalyst.zoho.com/en/getting-started/catalyst-projects) set up
- [Mobile app configuration](https://docs.catalyst.zoho.com/en/cloud-scale/help/push-notification/mobile-app-config/) (for mobile notifications)
- [Web push configuration](https://docs.catalyst.zoho.com/en/cloud-scale/help/push-notification/web-push/) (for web notifications)
- APNs/FCM credentials configured

## Installation

To install this package, simply type add or install @zcatalyst/push-notification
using your favorite package manager:

- `npm install @zcatalyst/push-notification`
- `yarn add @zcatalyst/push-notification`
- `pnpm add @zcatalyst/push-notification`

## Getting Started

### Import

The Catalyst SDK is modularized by Components.
To handle push notifications, you only need to import the `PushNotification`:

```js
// ES5 example
const { PushNotification } = require("@zcatalyst/push-notification");
```

```ts
// ES6+ example
import { PushNotification } from "@zcatalyst/push-notification";
```

### Usage

#### Node.js Environment

For server-side push notification management:

```js
const pushNotification = new PushNotification(app);

// Send mobile notifications
const mobileNotif = pushNotification.mobile('your-app-id');
await mobileNotif.sendIOSNotification(
  { message: 'Hello iOS User!', title: 'Notification' },
  'user@example.com'
);

await mobileNotif.sendAndroidNotification(
  { message: 'Hello Android User!', title: 'Notification' },
  'user@example.com'
);

// Send web notifications
const webNotif = pushNotification.web();
const success = await webNotif.sendNotification(
  'Hello Web Users!',
  ['user1@example.com', 'user2@example.com']
);
```

#### Browser Environment

For client-side push notification handling:

```js
const pushNotification = new PushNotification();

// Enable notifications
await pushNotification.enableNotification();

// Set up message handler
pushNotification.messageHandler = (message) => {
  console.log('Received push notification:', message);
};

// Set up error handler
pushNotification.errorHandler = (error) => {
  console.error('Push notification error:', error);
};

// Check if notifications are ready
if (pushNotification.isReady) {
  console.log('Push notifications are ready');
}

// Get current state
console.log('Notification state:', pushNotification.state);
```

### Environment Support

This package automatically detects the environment and provides appropriate functionality:

- **Node.js**: Mobile and web notification sending capabilities
- **Browser**: Push notification receiving and handling capabilities

### Async/await

We recommend using [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
operator to wait for the promise returned by notification operations:

```js
try {
  await pushNotification.enableNotification();
  // process successful notification setup.
} catch (error) {
  // error handling.
} finally {
  // finally.
}
```

### Error Handling

When the service returns an exception, the error will include the exception information,
as well as response metadata (e.g. request id).

```js
try {
  await pushNotification.enableNotification();
  // process notification setup.
} catch (error) {
  const message = error.message;
  const status = error.statusCode;
  console.log({ message, status });
}
```

## API Reference

### Node.js Methods

<details>
<summary>
Create Mobile Notification Instance
</summary>

```js
const mobileNotif = pushNotification.mobile('your-mobile-app-id');
```

- `app-id`: The registered mobile application ID

</details>

<details>
<summary>
Send iOS Notification
</summary>

```js
const result = await mobileNotif.sendIOSNotification(
  {
    message: 'Hello iOS User!',
    title: 'Important Update',
    subtitle: 'Check your app',
    badge: 1,
    sound: 'default',
    customData: { key: 'value' }
  },
  'user@example.com'
);
```

</details>

<details>
<summary>
Send Android Notification
</summary>

```js
const result = await mobileNotif.sendAndroidNotification(
  {
    message: 'Hello Android User!',
    title: 'Important Update',
    icon: 'notification_icon',
    color: '#FF0000',
    sound: 'default',
    vibration: [1000, 1000, 1000],
    customData: { key: 'value' }
  },
  'user@example.com'
);
```

</details>

<details>
<summary>
Create Web Notification Instance
</summary>

```js
const webNotif = pushNotification.web();
```

</details>

<details>
<summary>
Send Web Notification
</summary>

```js
const success = await webNotif.sendNotification(
  'Hello Web Users!',
  ['user1@example.com', 'user2@example.com']
);
```

- `message`: The notification message
- `recipients`: Array of user IDs or email addresses

</details>

### Browser Methods

<details>
<summary>
Enable Push Notifications
</summary>

```js
await pushNotification.enableNotification();
```

This method:
- Fetches notification configuration from server
- Dynamically loads WMS (Web Messaging Service) scripts
- Initializes the notification service with RTCP or ZMP protocol
- Sets up automatic retry logic with exponential backoff

</details>

<details>
<summary>
Set Message Handler
</summary>

```js
pushNotification.messageHandler = (message) => {
  console.log('Received notification:', message);
  
  // Handle different message types
  if (message.type === 'alert') {
    showAlert(message.content);
  } else if (message.type === 'update') {
    updateUI(message.data);
  }
};
```

</details>

<details>
<summary>
Set Error Handler
</summary>

```js
pushNotification.errorHandler = (error) => {
  console.error('Notification error:', error);
  
  // Handle specific error types
  if (error.message.includes('auth')) {
    refreshToken();
  } else if (error.message.includes('timeout')) {
    setTimeout(() => pushNotification.retry(), 5000);
  }
};
```

</details>

<details>
<summary>
Check Notification State
</summary>

```js
// Check if ready
if (pushNotification.isReady) {
  console.log('Notifications are ready');
}

// Get current state
console.log('State:', pushNotification.state); // 'uninitialized', 'initializing', 'ready', 'error'
```

</details>

<details>
<summary>
Manual Retry
</summary>

```js
// Manually retry initialization (only works in error state)
if (pushNotification.state === 'error') {
  await pushNotification.retry();
}
```

</details>

## Notification States

### State Enumeration

- **`uninitialized`** - Service has not been initialized
- **`initializing`** - Service is currently initializing
- **`ready`** - Service is ready to receive notifications
- **`error`** - Service encountered an error during initialization

### State Management

```js
const checkState = () => {
  switch (pushNotification.state) {
    case 'uninitialized':
      console.log('Initializing notifications...');
      pushNotification.enableNotification();
      break;
    case 'initializing':
      console.log('Notifications are initializing...');
      break;
    case 'ready':
      console.log('Notifications are ready!');
      break;
    case 'error':
      console.log('Notification error, retrying...');
      pushNotification.retry();
      break;
  }
};
```

## Mobile Notification Platforms

### Supported Platforms

```js
import { MOBILE_PLATFORM } from '@zcatalyst/push-notification';

// Available platforms
console.log(MOBILE_PLATFORM.IOS);      // 'ios'
console.log(MOBILE_PLATFORM.ANDROID);  // 'android'
```

### Platform-Specific Features

**iOS Notifications:**
- Badge numbers
- Sound customization
- Subtitle support
- Custom data payload
- Silent notifications

**Android Notifications:**
- Custom icons
- Color customization
- Vibration patterns
- Sound customization
- Custom data payload
- Priority levels

## Browser Compatibility

This package supports all modern browsers with ES6+ support. The browser implementation uses:

- **WMS (Web Messaging Service)** for real-time communication
- **RTCP Protocol** for enhanced authentication when available
- **ZMP Protocol** as fallback authentication method
- **Dynamic script injection** for loading WMS libraries
- **Automatic retry logic** with exponential backoff

## Resources

- [Catalyst Push Notification Documentation](https://docs.catalyst.zoho.com/en/cloud-scale/help/push-notification/introduction/)
- [Mobile App Configuration](https://docs.catalyst.zoho.com/en/cloud-scale/help/push-notification/mobile-app-config/)
- [Web Push Notifications](https://docs.catalyst.zoho.com/en/cloud-scale/help/push-notification/web-push/)
- [Push Notification SDK Reference](https://docs.catalyst.zoho.com/en/sdk/server-side-sdks/node-js-sdk/push-notification/)
- [SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/)

## Contributing

Contributions to this library are always welcome and highly encouraged.

See [CONTRIBUTING](../../CONTRIBUTING.md) for more information on how to get started.

## License

This SDK is distributed under the Apache License 2.0. See [LICENSE](../../LICENCE) file for more information.
