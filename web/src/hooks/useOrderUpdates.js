import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const STOMP_URL = import.meta.env.VITE_STOMP_URL || 'http://localhost:8080/ws';

export const useOrderUpdates = (userId) => {
    const [lastOrderUpdate, setLastOrderUpdate] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const socket = new SockJS(STOMP_URL);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe(`/topic/orders/${userId}`, (message) => {
                    const updatedOrder = JSON.parse(message.body);
                    setLastOrderUpdate(updatedOrder);
                });
            },
            onStompError: (frame) => {
                console.error('Broker error: ' + frame.headers['message']);
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [userId]);

    return lastOrderUpdate;
};
