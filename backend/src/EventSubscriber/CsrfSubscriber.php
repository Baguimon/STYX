<?php
namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Csrf\CsrfToken;

class CsrfSubscriber implements EventSubscriberInterface
{
    public function __construct(private CsrfTokenManagerInterface $csrfTokenManager){}

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if ($request->isMethodSafe() || !str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        if (in_array($request->getPathInfo(), ['/api/login', '/api/register', '/api/csrf-token'])) {
            return;
        }

        $header = $request->headers->get('X-CSRF-TOKEN');
        if (!$header || !$this->csrfTokenManager->isTokenValid(new CsrfToken('api', $header))) {
            $event->setResponse(new Response('Invalid CSRF token', Response::HTTP_FORBIDDEN));
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'kernel.request' => 'onKernelRequest',
        ];
    }
}
