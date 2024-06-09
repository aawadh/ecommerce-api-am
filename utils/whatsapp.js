import axios from 'axios';
import asyncHandler from "express-async-handler";
import { diskStorage } from 'multer';
import fetch from "node-fetch";
import fs from "fs";



export function sendOrderDetailsCustomer (name, orderId, totalPrice, Ameen) {
    const options = {
        method: 'POST',
        url: 'https://graph.facebook.com/v' + process.env.WHATSAPP_VERSION + '/' + process.env.WHATSAPP_PHONE_NUMBER_ID + '/messages',
        headers: {
            Authorization: 'Bearer ' + process.env.WHATSAPP_SECRETKEY,
            'Content-Type': 'application/json'
        },
        data: {
            messaging_product: 'whatsapp',
            to: process.env.DELEVIRY_MANAGER_NUMBER,
            type: 'template',
            template: {
                name: 'order_message',
                language: {
                    code: 'ar'
                },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            {
                                type: 'text',
                                text: name
                            },
                            {
                                type: 'text',
                                text: orderId
                            },
                            {
                                type: 'text',
                                text: totalPrice
                            },
                            {
                                type: 'text',
                                text: Ameen
                            },
                        ]
                    }
                ]
            }
        },
        json: true
    };
    axios.request(options).then(function (res) {

    })
        .catch(function (error) {
            console.error(error);
        });
};
    

export const sendOrderDetailsDeliveryManager = asyncHandler(async (req, res) => {
    const options = {
        method: 'POST',
        url: 'https://graph.facebook.com/v' + process.env.WHATSAPP_VERSION + '/' + process.env.WHATSAPP_PHONE_NUMBER_ID + '/messages',
        headers: {
            Authorization: 'Bearer ' + process.env.WHATSAPP_SECRETKEY,
            'Content-Type': 'application/json'
        },
        data: {
            messaging_product: 'whatsapp',
            to: process.env.DELEVIRY_MANAGER_NUMBER,
            type: 'template',
            template: {
                name: 'hello_world',
                language: {
                    code: 'en_US'
                }
            }
        },
        json: true
    };
    axios.request(options).then(function (res) {

    })
        .catch(function (error) {
            console.error(error);
        });
    res.status(200).json({
        success: true,
        message: "Delivery manager Order Details Message",
    });
});

export const sendPDFInvoice = asyncHandler(async (req, res) => {
    // PDF Generation
    const options = {
        method: 'POST',
        url: 'https://graph.facebook.com/v' + process.env.WHATSAPP_VERSION + '/' + process.env.WHATSAPP_PHONE_NUMBER_ID + '/messages',
        headers: {
            Authorization: 'Bearer ' + process.env.WHATSAPP_SECRETKEY,
            'Content-Type': 'application/json'
        },
        data: {
            messaging_product: 'whatsapp',
            to: process.env.DELEVIRY_MANAGER_NUMBER,
            type: 'document',
            document: {
                id: '',
                fileName: 'Invoice',
            }
        },
        json: true
    };
    axios.request(options).then(function (res) {

    })
        .catch(function (error) {
            console.error(error);
        });
});
