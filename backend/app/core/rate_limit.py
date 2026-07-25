import time
from fastapi import Request, HTTPException, status, Depends

_rate_limit_store: dict[str, list[float]] = {}


def rate_limit(max_calls: int = 5, window_seconds: int = 900):
    def dependency(request: Request):
        client_ip = request.client.host if request.client else 'unknown'
        now = time.time()
        key = f'{client_ip}:{request.url.path}'

        if key not in _rate_limit_store:
            _rate_limit_store[key] = []

        # Clean old timestamps
        _rate_limit_store[key] = [ts for ts in _rate_limit_store[key] if now - ts < window_seconds]

        if len(_rate_limit_store[key]) >= max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail='Too many requests. Please try again later.'
            )

        _rate_limit_store[key].append(now)

    return Depends(dependency)
